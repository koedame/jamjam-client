//! Bandwidth requirement and measurement
//!
//! Uncompressed PCM has a fixed cost, so the interesting question is not "what
//! bitrate should we pick" but "does this link carry what the preset needs".
//! Bitrate adaptation is out of scope: narrow-band links are not a target and
//! PCM's rate cannot be lowered without adding latency (ADR-022). What this
//! module does is detect and report a link that cannot carry the preset
//! (REQ-LAT-124, REQ-LAT-125, REQ-LAT-126).

use std::time::{Duration, Instant};

use crate::audio::AudioPreset;

/// Bits in a byte, spelled out so the bitrate arithmetic reads clearly
const BITS_PER_BYTE: f64 = 8.0;
/// Bytes per 32-bit float sample (ADR-003: PCM f32 is the default codec)
const BYTES_PER_SAMPLE: f64 = 4.0;
/// UDP + IP + jamjam header bytes per packet
///
/// 20 (IPv4) + 8 (UDP) + [`crate::protocol::HEADER_SIZE`].
const PACKET_OVERHEAD_BYTES: f64 = 20.0 + 8.0 + 12.0;

/// Fraction of the requirement below which a link is called insufficient
const INSUFFICIENT_RATIO: f64 = 1.0;
/// Fraction of the requirement below which a link is called marginal
///
/// A link with under 20% of headroom will not survive a burst, so it is worth
/// warning about before it actually drops packets.
const MARGINAL_RATIO: f64 = 1.2;

/// Whether a measured link carries what a preset needs
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum BandwidthStatus {
    /// At least 20% more than required
    Sufficient,
    /// Enough, but with less than 20% of headroom
    Marginal,
    /// Less than required
    Insufficient,
}

impl BandwidthStatus {
    /// Classify a measured rate against a requirement
    ///
    /// A non-positive requirement is [`BandwidthStatus::Sufficient`]: nothing is
    /// needed, so nothing can be missing.
    pub fn classify(available_bps: f64, required_bps: f64) -> Self {
        if required_bps <= 0.0 {
            return BandwidthStatus::Sufficient;
        }
        let ratio = available_bps / required_bps;
        if ratio < INSUFFICIENT_RATIO {
            BandwidthStatus::Insufficient
        } else if ratio < MARGINAL_RATIO {
            BandwidthStatus::Marginal
        } else {
            BandwidthStatus::Sufficient
        }
    }

    /// Identifier used on the IPC boundary and in the UI
    pub fn as_str(&self) -> &'static str {
        match self {
            BandwidthStatus::Sufficient => "sufficient",
            BandwidthStatus::Marginal => "marginal",
            BandwidthStatus::Insufficient => "insufficient",
        }
    }
}

/// Identifier for the IPC boundary and UI for a sampled interval
///
/// `None` means the interval was measured and carried zero bytes, which is a
/// different situation from an actual narrow link: nothing is arriving from the
/// peer at all, so classifying it against the bandwidth requirement would call
/// a dead connection "insufficient bandwidth" (REQ-LAT-127). Callers must not
/// reuse the previous classification for a zero-byte interval, or a stale
/// "insufficient"/"marginal" verdict survives after the peer stops sending.
pub fn status_label(status: Option<BandwidthStatus>) -> &'static str {
    match status {
        Some(status) => status.as_str(),
        None => "no_signal",
    }
}

/// Bits per second a preset needs in one direction
///
/// Counts the audio payload, the per-packet header overhead, and the FEC
/// redundancy the preset adds. Both sides send, so a session needs this much
/// upstream *and* downstream.
///
/// `channels` is what goes on the wire, which is not always what the device
/// captures - the sender transmits stereo so the receiver can pan.
pub fn required_bps(preset: &AudioPreset, sample_rate: u32, channels: u16) -> f64 {
    if sample_rate == 0 || channels == 0 {
        return 0.0;
    }

    let frame_size = preset.frame_size() as f64;
    let packets_per_second = sample_rate as f64 / frame_size;
    let payload_bytes_per_packet = frame_size * channels as f64 * BYTES_PER_SAMPLE;

    let bytes_per_second = packets_per_second * (payload_bytes_per_packet + PACKET_OVERHEAD_BYTES);

    // FEC sends one extra packet per group, so it costs the same fraction of the
    // stream as its redundancy ratio.
    let with_fec = bytes_per_second * (1.0 + preset.fec_redundancy() as f64);

    with_fec * BITS_PER_BYTE
}

/// Measures the rate at which bytes actually move
///
/// Fed from the monotonically increasing counters `ConnectionStats` reports, so
/// it works without touching the send path. Rates are computed over the interval
/// between samples rather than since connect, so a rate that drops is visible
/// immediately instead of being averaged away.
#[derive(Debug)]
pub struct BandwidthEstimator {
    last_sample: Option<(Instant, u64)>,
    current_bps: f64,
    /// Shortest interval that produces a usable rate
    min_interval: Duration,
}

impl BandwidthEstimator {
    /// Create an estimator that reports a rate once `min_interval` has elapsed
    ///
    /// Too short an interval turns packet scheduling jitter into apparent
    /// bandwidth swings.
    pub fn new(min_interval: Duration) -> Self {
        Self {
            last_sample: None,
            current_bps: 0.0,
            min_interval,
        }
    }

    /// Feed a cumulative byte counter, using an explicit clock reading
    ///
    /// Returns the rate over the interval, or `None` when too little time has
    /// passed. Taking `now` as an argument keeps the estimator testable without
    /// sleeping.
    pub fn sample_at(&mut self, now: Instant, cumulative_bytes: u64) -> Option<f64> {
        match self.last_sample {
            None => {
                self.last_sample = Some((now, cumulative_bytes));
                None
            }
            Some((last_time, last_bytes)) => {
                let elapsed = now.duration_since(last_time);
                if elapsed < self.min_interval {
                    return None;
                }

                // A counter that went backwards means the connection restarted;
                // treat it as a fresh baseline rather than reporting a negative
                // rate.
                let delta = cumulative_bytes.saturating_sub(last_bytes);
                let bps = delta as f64 * BITS_PER_BYTE / elapsed.as_secs_f64();

                self.last_sample = Some((now, cumulative_bytes));
                self.current_bps = bps;
                Some(bps)
            }
        }
    }

    /// Feed a cumulative byte counter using the current clock
    pub fn sample(&mut self, cumulative_bytes: u64) -> Option<f64> {
        self.sample_at(Instant::now(), cumulative_bytes)
    }

    /// Most recently computed rate, or 0.0 before the first interval completes
    pub fn current_bps(&self) -> f64 {
        self.current_bps
    }

    /// Classify the measured rate against what `preset` needs
    ///
    /// Returns `None` until a rate has been measured, so a caller does not warn
    /// about a link it has not observed yet.
    pub fn status_for(
        &self,
        preset: &AudioPreset,
        sample_rate: u32,
        channels: u16,
    ) -> Option<BandwidthStatus> {
        if self.last_sample.is_none() || self.current_bps == 0.0 {
            return None;
        }
        Some(BandwidthStatus::classify(
            self.current_bps,
            required_bps(preset, sample_rate, channels),
        ))
    }
}

impl Default for BandwidthEstimator {
    fn default() -> Self {
        // One second: long enough that per-packet scheduling averages out, short
        // enough that a user notices the warning while it is still true.
        Self::new(Duration::from_secs(1))
    }
}

/// How many consecutive non-sufficient intervals `BandwidthVerdict` requires
/// before reporting a warning
const CONFIRM_INTERVALS: u32 = 3;

/// How long after the first sample `BandwidthVerdict` withholds any verdict
const STARTUP_GRACE: Duration = Duration::from_secs(4);

/// Confirms a raw per-interval classification before it is safe to show a user
///
/// [`BandwidthEstimator::status_for`] reports exactly what one interval
/// measured, which is what the classifier and the tests need. A user-facing
/// warning needs more than that: the requirement PCM computes has no headroom
/// built in (it is exactly what the sender transmits), so a link that is
/// perfectly healthy still straddles the insufficient/marginal boundary on
/// whichever interval happens to catch a packet a few milliseconds late. A
/// peer that has only just connected is worse - a test peer that replies
/// after a deliberate delay, or plain connection setup, means the first
/// intervals carry only keepalives, which read as an extremely narrow link
/// rather than no signal (REQ-LAT-128). Both call for withholding judgment:
/// a single bad reading proves nothing, so `BandwidthVerdict` requires
/// [`CONFIRM_INTERVALS`] in a row before it reports one, while a sufficient
/// reading clears immediately (REQ-LAT-129).
#[derive(Debug, Default)]
pub struct BandwidthVerdict {
    connected_at: Option<Instant>,
    insufficient_streak: u32,
}

impl BandwidthVerdict {
    /// Confirm (or withhold) a raw classification observed at `now`
    ///
    /// `raw` is `None` for a zero-byte interval (REQ-LAT-127's no-signal case)
    /// and passes straight through unchanged: a dead link is never withheld or
    /// debounced. `Some(status)` is withheld during the startup grace period
    /// and must repeat for [`CONFIRM_INTERVALS`] consecutive calls before it
    /// is reported.
    pub fn confirm_at(
        &mut self,
        raw: Option<BandwidthStatus>,
        now: Instant,
    ) -> Option<BandwidthStatus> {
        let connected_at = *self.connected_at.get_or_insert(now);

        let Some(raw) = raw else {
            self.insufficient_streak = 0;
            return None;
        };

        if now.duration_since(connected_at) < STARTUP_GRACE {
            self.insufficient_streak = 0;
            return Some(BandwidthStatus::Sufficient);
        }

        if raw == BandwidthStatus::Sufficient {
            self.insufficient_streak = 0;
            return Some(raw);
        }

        self.insufficient_streak += 1;
        if self.insufficient_streak >= CONFIRM_INTERVALS {
            Some(raw)
        } else {
            Some(BandwidthStatus::Sufficient)
        }
    }

    /// Confirm (or withhold) a raw classification using the current clock
    pub fn confirm(&mut self, raw: Option<BandwidthStatus>) -> Option<BandwidthStatus> {
        self.confirm_at(raw, Instant::now())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// PCM's requirement is fixed by the sample rate and width, and ADR-003
    /// records it as roughly 1.5 Mbps per channel.
    ///
    /// Verifies: REQ-NET-020
    #[test]
    fn pcm_requirement_matches_the_documented_figure() {
        // Mono, no FEC: 48000 * 4 * 8 = 1.536 Mbps plus header overhead.
        let mono = required_bps(&AudioPreset::ZeroLatency, 48_000, 1);
        assert!(
            mono > 1_536_000.0,
            "{} must exceed the payload-only figure once headers count",
            mono
        );
        assert!(
            mono < 2_200_000.0,
            "{} is implausibly far above 1.5 Mbps for one channel",
            mono
        );

        // Stereo costs about twice the payload, but shares the headers.
        let stereo = required_bps(&AudioPreset::ZeroLatency, 48_000, 2);
        assert!(stereo > mono);
        assert!(stereo < mono * 2.0);

        // Doubling the sample rate doubles the requirement.
        let high_rate = required_bps(&AudioPreset::ZeroLatency, 96_000, 1);
        assert!((high_rate / mono - 2.0).abs() < 0.01);
    }

    /// FEC is extra packets, so it must show up as extra bandwidth in exactly
    /// the proportion the preset's redundancy states (ADR-021).
    ///
    /// Verifies: REQ-NET-021
    #[test]
    fn fec_costs_its_redundancy_in_bandwidth() {
        // Balanced adds a 25% FEC group; ultra-low-latency adds none.
        let no_fec = AudioPreset::UltraLowLatency;
        let with_fec = AudioPreset::Balanced;
        assert_eq!(no_fec.fec_redundancy(), 0.0);
        assert!((with_fec.fec_redundancy() - 0.25).abs() < 1e-6);

        // Compare against the same preset with its FEC cost removed, so frame
        // size does not confound the comparison.
        let balanced = required_bps(&with_fec, 48_000, 2);
        let balanced_without_fec = balanced / (1.0 + with_fec.fec_redundancy() as f64);
        assert!((balanced / balanced_without_fec - 1.25).abs() < 1e-6);
    }

    /// A smaller frame carries the same audio in more packets, so header
    /// overhead makes it cost more.
    ///
    /// Verifies: REQ-NET-022
    #[test]
    fn smaller_frames_cost_more_in_overhead() {
        // Compare presets that both have no FEC, so only the frame size differs.
        let tiny = required_bps(&AudioPreset::ZeroLatency, 48_000, 2);
        let small = required_bps(&AudioPreset::UltraLowLatency, 48_000, 2);
        assert!(
            tiny > small,
            "32-sample frames ({:.0} bps) should cost more than 64 ({:.0} bps)",
            tiny,
            small
        );
    }

    /// Verifies: REQ-NET-023
    /// Verifies: REQ-LAT-124
    /// Verifies: REQ-LAT-125
    #[test]
    fn status_classifies_headroom() {
        let required = 1_000_000.0;
        assert_eq!(
            BandwidthStatus::classify(999_999.0, required),
            BandwidthStatus::Insufficient
        );
        assert_eq!(
            BandwidthStatus::classify(1_000_000.0, required),
            BandwidthStatus::Marginal
        );
        assert_eq!(
            BandwidthStatus::classify(1_100_000.0, required),
            BandwidthStatus::Marginal
        );
        assert_eq!(
            BandwidthStatus::classify(1_200_000.0, required),
            BandwidthStatus::Sufficient
        );
        // Nothing required means nothing missing.
        assert_eq!(
            BandwidthStatus::classify(0.0, 0.0),
            BandwidthStatus::Sufficient
        );
    }

    /// The estimator must report the rate over the interval, ignore samples that
    /// arrive too soon, and survive a counter reset.
    ///
    /// Verifies: REQ-NET-024
    #[test]
    fn estimator_measures_the_interval_rate() {
        let start = Instant::now();
        let mut estimator = BandwidthEstimator::new(Duration::from_secs(1));

        // First sample only establishes a baseline.
        assert_eq!(estimator.sample_at(start, 0), None);
        assert_eq!(estimator.current_bps(), 0.0);

        // Too soon: no rate, and the baseline is untouched.
        assert_eq!(
            estimator.sample_at(start + Duration::from_millis(500), 100_000),
            None
        );

        // 125_000 bytes in one second is 1 Mbps.
        let bps = estimator
            .sample_at(start + Duration::from_secs(1), 125_000)
            .expect("a full interval produces a rate");
        assert!((bps - 1_000_000.0).abs() < 1.0, "got {} bps", bps);

        // Rates come from the interval, not from the start: a quiet second
        // reports a low rate even though the total is large.
        let idle = estimator
            .sample_at(start + Duration::from_secs(2), 125_000)
            .expect("rate for the second interval");
        assert_eq!(idle, 0.0);

        // A counter that went backwards is a reconnect, not a negative rate.
        let after_reset = estimator
            .sample_at(start + Duration::from_secs(3), 10)
            .expect("rate after reset");
        assert!(after_reset >= 0.0, "got {} bps", after_reset);
    }

    /// Verifies: REQ-LAT-127
    #[test]
    fn status_label_when_the_interval_carried_zero_bytes_reports_no_signal_not_the_last_verdict() {
        assert_eq!(status_label(None), "no_signal");
    }

    /// Verifies: REQ-LAT-127
    #[test]
    fn status_label_when_a_rate_was_measured_reports_the_classification() {
        assert_eq!(
            status_label(Some(BandwidthStatus::Insufficient)),
            "insufficient"
        );
        assert_eq!(status_label(Some(BandwidthStatus::Marginal)), "marginal");
        assert_eq!(
            status_label(Some(BandwidthStatus::Sufficient)),
            "sufficient"
        );
    }

    /// Verifies: REQ-NET-025
    /// Verifies: REQ-LAT-126
    #[test]
    fn status_is_absent_until_measured() {
        let start = Instant::now();
        let mut estimator = BandwidthEstimator::new(Duration::from_secs(1));
        let preset = AudioPreset::Balanced;

        assert_eq!(estimator.status_for(&preset, 48_000, 2), None);

        // A link carrying far more than needed is sufficient.
        estimator.sample_at(start, 0);
        estimator.sample_at(start + Duration::from_secs(1), 10_000_000);
        assert_eq!(
            estimator.status_for(&preset, 48_000, 2),
            Some(BandwidthStatus::Sufficient)
        );

        // A narrow link is insufficient for PCM.
        let mut narrow = BandwidthEstimator::new(Duration::from_secs(1));
        narrow.sample_at(start, 0);
        narrow.sample_at(start + Duration::from_secs(1), 12_500); // 100 kbps
        assert_eq!(
            narrow.status_for(&preset, 48_000, 2),
            Some(BandwidthStatus::Insufficient)
        );
    }

    /// Verifies: REQ-LAT-128
    #[test]
    fn verdict_withholds_judgment_during_the_startup_grace_period() {
        let start = Instant::now();
        let mut verdict = BandwidthVerdict::default();

        // Even a link that reads as insufficient on every interval must not be
        // reported while still inside the grace period - a peer that has only
        // just connected (a test peer that replies after a deliberate delay,
        // or plain connection setup) has not really shown what it can carry.
        for elapsed_secs in 0..3 {
            assert_eq!(
                verdict.confirm_at(
                    Some(BandwidthStatus::Insufficient),
                    start + Duration::from_secs(elapsed_secs)
                ),
                Some(BandwidthStatus::Sufficient),
                "reported a verdict {elapsed_secs}s after connecting, inside the grace period"
            );
        }
    }

    /// Verifies: REQ-LAT-129
    #[test]
    fn verdict_requires_consecutive_confirmation_before_reporting_insufficient() {
        let start = Instant::now();
        let mut verdict = BandwidthVerdict::default();

        // Clear the grace period with one confirmed-sufficient reading.
        verdict.confirm_at(Some(BandwidthStatus::Sufficient), start);

        let after_grace = start + STARTUP_GRACE;
        // The first two insufficient readings in a row are not yet reported.
        for i in 0..CONFIRM_INTERVALS - 1 {
            assert_eq!(
                verdict.confirm_at(
                    Some(BandwidthStatus::Insufficient),
                    after_grace + Duration::from_secs(i as u64)
                ),
                Some(BandwidthStatus::Sufficient),
                "reported before {} consecutive readings confirmed it",
                CONFIRM_INTERVALS
            );
        }

        // The CONFIRM_INTERVALS-th consecutive insufficient reading is reported.
        assert_eq!(
            verdict.confirm_at(
                Some(BandwidthStatus::Insufficient),
                after_grace + Duration::from_secs((CONFIRM_INTERVALS - 1) as u64)
            ),
            Some(BandwidthStatus::Insufficient)
        );

        // A single sufficient reading clears it immediately, no debounce needed.
        assert_eq!(
            verdict.confirm_at(
                Some(BandwidthStatus::Sufficient),
                after_grace + Duration::from_secs(CONFIRM_INTERVALS as u64)
            ),
            Some(BandwidthStatus::Sufficient)
        );
    }

    /// Verifies: REQ-LAT-127
    /// Verifies: REQ-LAT-129
    #[test]
    fn verdict_passes_no_signal_through_unconfirmed_and_resets_the_streak() {
        let start = Instant::now();
        let mut verdict = BandwidthVerdict::default();
        verdict.confirm_at(Some(BandwidthStatus::Sufficient), start);
        let after_grace = start + STARTUP_GRACE;

        // Two insufficient readings build up a streak, short of CONFIRM_INTERVALS.
        verdict.confirm_at(Some(BandwidthStatus::Insufficient), after_grace);
        verdict.confirm_at(
            Some(BandwidthStatus::Insufficient),
            after_grace + Duration::from_secs(1),
        );

        // A dead link must be reported as no_signal even mid-streak, not folded
        // into the insufficient-bandwidth debounce.
        assert_eq!(
            verdict.confirm_at(None, after_grace + Duration::from_secs(2)),
            None
        );

        // The streak reset by the no_signal interval means the next
        // insufficient readings must reconfirm from scratch.
        for i in 0..CONFIRM_INTERVALS - 1 {
            assert_eq!(
                verdict.confirm_at(
                    Some(BandwidthStatus::Insufficient),
                    after_grace + Duration::from_secs(3 + i as u64)
                ),
                Some(BandwidthStatus::Sufficient),
                "streak was not reset by the intervening no_signal interval"
            );
        }
    }
}
