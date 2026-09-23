//! Audio resampling module (ADR-013)
//!
//! Provides sample rate conversion for receive-side audio processing.
//! Per ADR-013: Resampling is performed on the receive side only.
//! The sender transmits at their native sample rate, and the receiver
//! converts to their local sample rate if necessary.

use rubato::audioadapter_buffers::direct::InterleavedSlice;
use rubato::{Async, FixedAsync, PolynomialDegree, Resampler as RubatoResampler};

/// Error type for resampler operations
#[derive(Debug, thiserror::Error)]
pub enum ResamplerError {
    #[error("Resampler creation failed: {0}")]
    CreationFailed(String),
    #[error("Resampling failed: {0}")]
    ProcessFailed(String),
    #[error("Invalid sample rate: {0}")]
    InvalidSampleRate(u32),
}

/// Trait for audio resampling
pub trait AudioResampler: Send {
    /// Process input samples and return resampled output
    fn process(&mut self, input: &[f32]) -> Result<Vec<f32>, ResamplerError>;

    /// Get the latency introduced by resampling in samples (at output rate)
    fn latency_samples(&self) -> usize;

    /// Get the latency introduced by resampling in milliseconds
    fn latency_ms(&self, output_rate: u32) -> f32 {
        (self.latency_samples() as f32 / output_rate as f32) * 1000.0
    }
}

/// Passthrough resampler for same sample rate (no conversion)
pub struct PassthroughResampler;

impl AudioResampler for PassthroughResampler {
    fn process(&mut self, input: &[f32]) -> Result<Vec<f32>, ResamplerError> {
        Ok(input.to_vec())
    }

    fn latency_samples(&self) -> usize {
        0
    }
}

/// Fast resampler using rubato for real-time audio
pub struct FastResampler {
    resampler: Async<f32>,
    input_rate: u32,
    output_rate: u32,
    channels: usize,
    /// Frames (not samples) per resampler call
    chunk_size: usize,
    /// Interleaved input awaiting a full chunk
    input_buffer: Vec<f32>,
}

impl FastResampler {
    /// Create a new fast resampler
    ///
    /// # Arguments
    /// * `input_rate` - Input sample rate in Hz
    /// * `output_rate` - Output sample rate in Hz
    /// * `chunk_size` - Expected input chunk size (frame size)
    pub fn new(
        input_rate: u32,
        output_rate: u32,
        chunk_size: usize,
    ) -> Result<Self, ResamplerError> {
        Self::with_channels(input_rate, output_rate, chunk_size, 1)
    }

    /// Create a resampler for interleaved audio with `channels` channels
    ///
    /// # Arguments
    /// * `input_rate` - Input sample rate in Hz
    /// * `output_rate` - Output sample rate in Hz
    /// * `chunk_size` - Frames per resampler call (not samples)
    /// * `channels` - Interleaved channel count
    ///
    /// The receive path carries stereo, so a mono-only resampler would leave a
    /// peer at a different sample rate playing back at the wrong speed.
    pub fn with_channels(
        input_rate: u32,
        output_rate: u32,
        chunk_size: usize,
        channels: usize,
    ) -> Result<Self, ResamplerError> {
        if input_rate == 0 || output_rate == 0 {
            return Err(ResamplerError::InvalidSampleRate(0));
        }
        if channels == 0 {
            return Err(ResamplerError::CreationFailed(
                "channel count must be at least 1".to_string(),
            ));
        }

        let resample_ratio = output_rate as f64 / input_rate as f64;

        // Use polynomial interpolation with a fixed input size for low-latency
        // real-time processing
        // PolynomialDegree::Cubic is a good quality/latency trade-off
        let resampler = Async::<f32>::new_poly(
            resample_ratio,
            1.0, // max_resample_ratio_relative (no dynamic adjustment needed)
            PolynomialDegree::Cubic,
            chunk_size,
            channels,
            FixedAsync::Input,
        )
        .map_err(|e| ResamplerError::CreationFailed(e.to_string()))?;

        Ok(Self {
            resampler,
            input_rate,
            output_rate,
            channels,
            chunk_size,
            input_buffer: Vec::with_capacity(chunk_size * channels * 2),
        })
    }

    /// Interleaved channel count
    pub fn channels(&self) -> usize {
        self.channels
    }

    /// Get the input sample rate
    pub fn input_rate(&self) -> u32 {
        self.input_rate
    }

    /// Get the output sample rate
    pub fn output_rate(&self) -> u32 {
        self.output_rate
    }
}

impl AudioResampler for FastResampler {
    fn process(&mut self, input: &[f32]) -> Result<Vec<f32>, ResamplerError> {
        // Add interleaved input to the buffer
        self.input_buffer.extend_from_slice(input);

        // A chunk is `chunk_size` frames across every channel.
        let samples_per_chunk = self.chunk_size * self.channels;
        let mut output = Vec::new();

        while self.input_buffer.len() >= samples_per_chunk {
            let chunk = InterleavedSlice::new(
                &self.input_buffer[..samples_per_chunk],
                self.channels,
                self.chunk_size,
            )
            .map_err(|e| ResamplerError::ProcessFailed(e.to_string()))?;

            let resampled = self
                .resampler
                .process(&chunk, None)
                .map_err(|e| ResamplerError::ProcessFailed(e.to_string()))?;
            output.extend_from_slice(&resampled.take_data());

            self.input_buffer.drain(..samples_per_chunk);
        }

        Ok(output)
    }

    fn latency_samples(&self) -> usize {
        // Polynomial interpolation has minimal latency (typically < 10 samples)
        self.resampler.output_delay()
    }
}

/// Create a resampler for the given sample rates
///
/// Returns a PassthroughResampler if input and output rates are the same,
/// otherwise returns a FastResampler.
pub fn create_resampler(
    input_rate: u32,
    output_rate: u32,
    chunk_size: usize,
) -> Result<Box<dyn AudioResampler>, ResamplerError> {
    create_resampler_with_channels(input_rate, output_rate, chunk_size, 1)
}

/// Create a resampler for interleaved audio with `channels` channels
///
/// `chunk_size` is frames, not samples. The receive path is stereo, so passing
/// 1 there would resample only every other sample and shift the pitch.
pub fn create_resampler_with_channels(
    input_rate: u32,
    output_rate: u32,
    chunk_size: usize,
    channels: usize,
) -> Result<Box<dyn AudioResampler>, ResamplerError> {
    if input_rate == output_rate {
        Ok(Box::new(PassthroughResampler))
    } else {
        Ok(Box::new(FastResampler::with_channels(
            input_rate,
            output_rate,
            chunk_size,
            channels,
        )?))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_passthrough_resampler() {
        let mut resampler = PassthroughResampler;
        let input: Vec<f32> = vec![0.1, 0.2, 0.3, 0.4, 0.5];
        let output = resampler.process(&input).unwrap();
        assert_eq!(input, output);
        assert_eq!(resampler.latency_samples(), 0);
    }

    #[test]
    fn test_fast_resampler_44100_to_48000() {
        let chunk_size = 128;
        let mut resampler = FastResampler::new(44100, 48000, chunk_size).unwrap();

        // Create a test signal (sine wave)
        let input: Vec<f32> = (0..chunk_size).map(|i| (i as f32 * 0.1).sin()).collect();

        let output = resampler.process(&input).unwrap();

        // Output should be approximately 48000/44100 times the input length
        let expected_ratio = 48000.0 / 44100.0;
        let expected_len = (chunk_size as f32 * expected_ratio).round() as usize;
        // Allow some tolerance due to internal buffering
        assert!(
            output.len() >= expected_len - 10 && output.len() <= expected_len + 10,
            "Expected ~{} samples, got {}",
            expected_len,
            output.len()
        );
    }

    #[test]
    fn test_fast_resampler_48000_to_44100() {
        let chunk_size = 128;
        let mut resampler = FastResampler::new(48000, 44100, chunk_size).unwrap();

        let input: Vec<f32> = (0..chunk_size).map(|i| (i as f32 * 0.1).sin()).collect();

        let output = resampler.process(&input).unwrap();

        let expected_ratio = 44100.0 / 48000.0;
        let expected_len = (chunk_size as f32 * expected_ratio).round() as usize;
        assert!(
            output.len() >= expected_len - 10 && output.len() <= expected_len + 10,
            "Expected ~{} samples, got {}",
            expected_len,
            output.len()
        );
    }

    #[test]
    fn test_create_resampler_passthrough() {
        let resampler = create_resampler(48000, 48000, 128).unwrap();
        assert_eq!(resampler.latency_samples(), 0);
    }

    #[test]
    fn test_create_resampler_conversion() {
        let resampler = create_resampler(44100, 48000, 128).unwrap();
        // FastResampler should have some latency (just verify it works)
        let _ = resampler.latency_samples();
    }
}
