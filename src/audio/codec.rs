//! Audio codec abstraction for encoding/decoding audio frames
//!
//! Provides a unified interface for different audio codecs (PCM, Opus).
//! Opus support requires the `opus-codec` feature. It builds a bundled libopus, which needs cmake.

use thiserror::Error;

/// Codec type enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum CodecType {
    /// Raw PCM (no compression, for LAN mode)
    #[default]
    Pcm,
    /// Opus codec (for internet mode)
    Opus,
}

impl CodecType {
    /// Get codec type from flags byte value
    pub fn from_flags(value: u8) -> Self {
        match value & 0b11 {
            0 => CodecType::Pcm,
            1 => CodecType::Opus,
            _ => CodecType::Pcm,
        }
    }

    /// Get flags byte value for this codec type
    pub fn to_flags(&self) -> u8 {
        match self {
            CodecType::Pcm => 0,
            CodecType::Opus => 1,
        }
    }

    /// Check if this codec type is available in the current build
    pub fn is_available(&self) -> bool {
        match self {
            CodecType::Pcm => true,
            #[cfg(feature = "opus-codec")]
            CodecType::Opus => true,
            #[cfg(not(feature = "opus-codec"))]
            CodecType::Opus => false,
        }
    }
}

/// Codec configuration
#[derive(Debug, Clone)]
pub struct CodecConfig {
    /// Codec type to use
    pub codec_type: CodecType,
    /// Sample rate in Hz (default: 48000)
    pub sample_rate: u32,
    /// Number of channels (1 = mono, 2 = stereo)
    pub channels: u16,
    /// Frame size in samples (default: 120 for 2.5ms @ 48kHz)
    pub frame_size: u32,
    /// Bitrate for Opus in bits per second (default: 128000)
    pub bitrate: u32,
}

impl Default for CodecConfig {
    fn default() -> Self {
        Self {
            codec_type: CodecType::Pcm,
            sample_rate: 48000,
            channels: 1,
            frame_size: 120, // 2.5ms @ 48kHz (Opus minimum)
            bitrate: 128000,
        }
    }
}

/// Errors that can occur during codec operations
#[derive(Error, Debug)]
pub enum CodecError {
    #[error("Codec initialization failed: {0}")]
    InitializationFailed(String),

    #[error("Encode failed: {0}")]
    EncodeFailed(String),

    #[error("Decode failed: {0}")]
    DecodeFailed(String),

    #[error("Invalid frame size: expected {expected}, got {actual}")]
    InvalidFrameSize { expected: usize, actual: usize },

    #[error("Invalid data format: {0}")]
    InvalidData(String),

    #[error("Codec not available: {0}")]
    NotAvailable(String),
}

/// Trait for audio codecs
///
/// `Send` but deliberately not `Sync`: libopus encoder and decoder states are
/// single-threaded, so `OpusCodec` cannot be shared across threads. Callers that
/// need sharing wrap it - `Arc<Mutex<Box<dyn AudioCodec>>>` is `Sync` as long as
/// the codec is `Send`, which is what the send path uses.
pub trait AudioCodec: Send {
    /// Encode audio samples to bytes
    ///
    /// # Arguments
    /// * `samples` - Interleaved f32 samples
    ///
    /// # Returns
    /// Encoded bytes suitable for network transmission
    fn encode(&mut self, samples: &[f32]) -> Result<Vec<u8>, CodecError>;

    /// Decode bytes to audio samples
    ///
    /// # Arguments
    /// * `data` - Encoded bytes received from network
    ///
    /// # Returns
    /// Interleaved f32 samples
    fn decode(&mut self, data: &[u8]) -> Result<Vec<f32>, CodecError>;

    /// Decode into a caller-provided buffer
    ///
    /// For use on the playback path, where allocating a `Vec` per frame is not
    /// affordable (ADR-020). Returns the number of samples written; `output`
    /// beyond that is left untouched.
    ///
    /// The default implementation forwards to [`Self::decode`] and copies, so a
    /// codec that cannot decode in place still works - it just allocates. PCM
    /// overrides this to write straight into `output`.
    ///
    /// # Errors
    /// Returns [`CodecError::InvalidFrameSize`] if `output` is too small to hold
    /// the decoded frame, rather than truncating audio silently.
    fn decode_into(&mut self, data: &[u8], output: &mut [f32]) -> Result<usize, CodecError> {
        let decoded = self.decode(data)?;
        if output.len() < decoded.len() {
            return Err(CodecError::InvalidFrameSize {
                expected: decoded.len(),
                actual: output.len(),
            });
        }
        output[..decoded.len()].copy_from_slice(&decoded);
        Ok(decoded.len())
    }

    /// Decode with PLC (Packet Loss Concealment)
    ///
    /// Called when a packet is lost. Generates interpolated/concealed audio.
    ///
    /// # Arguments
    /// * `frame_size` - Number of samples per channel to generate
    ///
    /// # Returns
    /// Interleaved f32 samples (concealment audio)
    fn decode_plc(&mut self, frame_size: usize) -> Result<Vec<f32>, CodecError>;

    /// Get codec type
    fn codec_type(&self) -> CodecType;

    /// Get frame size in samples per channel
    fn frame_size(&self) -> u32;

    /// Get number of channels
    fn channels(&self) -> u16;
}

/// PCM codec (passthrough, no compression)
///
/// Converts f32 samples to/from little-endian bytes.
/// Used for LAN mode where bandwidth is not a concern.
pub struct PcmCodec {
    frame_size: u32,
    channels: u16,
}

impl PcmCodec {
    /// Create a new PCM codec
    pub fn new(config: &CodecConfig) -> Self {
        Self {
            frame_size: config.frame_size,
            channels: config.channels,
        }
    }
}

impl AudioCodec for PcmCodec {
    fn encode(&mut self, samples: &[f32]) -> Result<Vec<u8>, CodecError> {
        // Convert f32 samples to little-endian bytes
        let bytes: Vec<u8> = samples.iter().flat_map(|&s| s.to_le_bytes()).collect();
        Ok(bytes)
    }

    fn decode(&mut self, data: &[u8]) -> Result<Vec<f32>, CodecError> {
        #[allow(clippy::manual_is_multiple_of)]
        if data.len() % 4 != 0 {
            return Err(CodecError::InvalidData(format!(
                "PCM data length {} is not a multiple of 4",
                data.len()
            )));
        }

        let samples: Vec<f32> = data
            .as_chunks::<4>()
            .0
            .iter()
            .map(|chunk| f32::from_le_bytes(*chunk))
            .collect();
        Ok(samples)
    }

    fn decode_into(&mut self, data: &[u8], output: &mut [f32]) -> Result<usize, CodecError> {
        #[allow(clippy::manual_is_multiple_of)]
        if data.len() % 4 != 0 {
            return Err(CodecError::InvalidData(format!(
                "PCM data length {} is not a multiple of 4",
                data.len()
            )));
        }

        let sample_count = data.len() / 4;
        if output.len() < sample_count {
            return Err(CodecError::InvalidFrameSize {
                expected: sample_count,
                actual: output.len(),
            });
        }

        for (slot, chunk) in output.iter_mut().zip(data.as_chunks::<4>().0) {
            *slot = f32::from_le_bytes(*chunk);
        }

        Ok(sample_count)
    }

    fn decode_plc(&mut self, frame_size: usize) -> Result<Vec<f32>, CodecError> {
        // PCM has no built-in PLC - return silence
        // Actual PLC is handled by PcmPlc struct
        let total_samples = frame_size * self.channels as usize;
        Ok(vec![0.0; total_samples])
    }

    fn codec_type(&self) -> CodecType {
        CodecType::Pcm
    }

    fn frame_size(&self) -> u32 {
        self.frame_size
    }

    fn channels(&self) -> u16 {
        self.channels
    }
}

// Opus codec implementation (requires opus-codec feature)
#[cfg(feature = "opus-codec")]
mod opus_impl {
    use super::*;

    /// Opus codec wrapper
    ///
    /// Uses the opus crate for encoding/decoding.
    /// Configured for low-latency audio (LowDelay application).
    pub struct OpusCodec {
        encoder: opus::Encoder,
        decoder: opus::Decoder,
        frame_size: u32,
        channels: u16,
        encode_buffer: Vec<u8>,
    }

    impl OpusCodec {
        /// Create a new Opus codec
        ///
        /// # Arguments
        /// * `config` - Codec configuration
        ///
        /// # Errors
        /// Returns error if Opus encoder/decoder initialization fails
        pub fn new(config: &CodecConfig) -> Result<Self, CodecError> {
            let channels = match config.channels {
                1 => opus::Channels::Mono,
                2 => opus::Channels::Stereo,
                _ => {
                    return Err(CodecError::InitializationFailed(format!(
                        "Unsupported channel count: {}",
                        config.channels
                    )))
                }
            };

            // Use LowDelay application for minimum latency
            let mut encoder =
                opus::Encoder::new(config.sample_rate, channels, opus::Application::LowDelay)
                    .map_err(|e| {
                        CodecError::InitializationFailed(format!("Encoder init failed: {}", e))
                    })?;

            // Set bitrate
            encoder
                .set_bitrate(opus::Bitrate::Bits(config.bitrate as i32))
                .map_err(|e| {
                    CodecError::InitializationFailed(format!("Set bitrate failed: {}", e))
                })?;

            let decoder = opus::Decoder::new(config.sample_rate, channels).map_err(|e| {
                CodecError::InitializationFailed(format!("Decoder init failed: {}", e))
            })?;

            // Pre-allocate encode buffer (max Opus packet size is ~1275 bytes)
            let encode_buffer = vec![0u8; 1500];

            Ok(Self {
                encoder,
                decoder,
                frame_size: config.frame_size,
                channels: config.channels,
                encode_buffer,
            })
        }
    }

    impl AudioCodec for OpusCodec {
        fn encode(&mut self, samples: &[f32]) -> Result<Vec<u8>, CodecError> {
            let expected_samples = self.frame_size as usize * self.channels as usize;
            if samples.len() != expected_samples {
                return Err(CodecError::InvalidFrameSize {
                    expected: expected_samples,
                    actual: samples.len(),
                });
            }

            let len = self
                .encoder
                .encode_float(samples, &mut self.encode_buffer)
                .map_err(|e| CodecError::EncodeFailed(format!("Opus encode failed: {}", e)))?;

            Ok(self.encode_buffer[..len].to_vec())
        }

        fn decode(&mut self, data: &[u8]) -> Result<Vec<f32>, CodecError> {
            let total_samples = self.frame_size as usize * self.channels as usize;
            let mut output = vec![0.0f32; total_samples];

            let _decoded = self
                .decoder
                .decode_float(data, &mut output, false)
                .map_err(|e| CodecError::DecodeFailed(format!("Opus decode failed: {}", e)))?;

            Ok(output)
        }

        fn decode_plc(&mut self, frame_size: usize) -> Result<Vec<f32>, CodecError> {
            // Opus built-in PLC: decode with None input
            let total_samples = frame_size * self.channels as usize;
            let mut output = vec![0.0f32; total_samples];

            let _decoded = self
                .decoder
                // An empty packet tells libopus to run its own concealment.
                .decode_float(&[], &mut output, false)
                .map_err(|e| CodecError::DecodeFailed(format!("Opus PLC failed: {}", e)))?;

            Ok(output)
        }

        fn codec_type(&self) -> CodecType {
            CodecType::Opus
        }

        fn frame_size(&self) -> u32 {
            self.frame_size
        }

        fn channels(&self) -> u16 {
            self.channels
        }
    }
}

#[cfg(feature = "opus-codec")]
pub use opus_impl::OpusCodec;

// Stub OpusCodec when feature is disabled
#[cfg(not(feature = "opus-codec"))]
pub struct OpusCodec;

#[cfg(not(feature = "opus-codec"))]
impl OpusCodec {
    pub fn new(_config: &CodecConfig) -> Result<Self, CodecError> {
        Err(CodecError::NotAvailable(
            "Opus codec requires the 'opus-codec' feature".to_string(),
        ))
    }
}

/// Create a codec based on configuration
pub fn create_codec(config: &CodecConfig) -> Result<Box<dyn AudioCodec>, CodecError> {
    match config.codec_type {
        CodecType::Pcm => Ok(Box::new(PcmCodec::new(config))),
        #[cfg(feature = "opus-codec")]
        CodecType::Opus => Ok(Box::new(OpusCodec::new(config)?)),
        #[cfg(not(feature = "opus-codec"))]
        CodecType::Opus => Err(CodecError::NotAvailable(
            "Opus codec requires the 'opus-codec' feature".to_string(),
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pcm_codec_roundtrip() {
        let config = CodecConfig {
            codec_type: CodecType::Pcm,
            frame_size: 120,
            channels: 1,
            ..Default::default()
        };

        let mut codec = PcmCodec::new(&config);

        // Create test samples
        let samples: Vec<f32> = (0..120).map(|i| (i as f32 / 120.0) * 2.0 - 1.0).collect();

        // Encode
        let encoded = codec.encode(&samples).unwrap();
        assert_eq!(encoded.len(), samples.len() * 4);

        // Decode
        let decoded = codec.decode(&encoded).unwrap();
        assert_eq!(decoded.len(), samples.len());

        // Verify roundtrip
        for (orig, dec) in samples.iter().zip(decoded.iter()) {
            assert!((orig - dec).abs() < 1e-6);
        }
    }

    #[test]
    fn test_pcm_codec_stereo() {
        let config = CodecConfig {
            codec_type: CodecType::Pcm,
            frame_size: 120,
            channels: 2,
            ..Default::default()
        };

        let mut codec = PcmCodec::new(&config);

        // Stereo: 120 samples * 2 channels = 240 total samples
        let samples: Vec<f32> = (0..240).map(|i| (i as f32 / 240.0) * 2.0 - 1.0).collect();

        let encoded = codec.encode(&samples).unwrap();
        let decoded = codec.decode(&encoded).unwrap();

        assert_eq!(decoded.len(), samples.len());
    }

    #[test]
    fn test_codec_type_flags() {
        assert_eq!(CodecType::Pcm.to_flags(), 0);
        assert_eq!(CodecType::Opus.to_flags(), 1);

        assert_eq!(CodecType::from_flags(0), CodecType::Pcm);
        assert_eq!(CodecType::from_flags(1), CodecType::Opus);
        assert_eq!(CodecType::from_flags(2), CodecType::Pcm); // Unknown defaults to PCM
    }

    #[test]
    fn test_codec_availability() {
        assert!(CodecType::Pcm.is_available());

        #[cfg(feature = "opus-codec")]
        assert!(CodecType::Opus.is_available());

        #[cfg(not(feature = "opus-codec"))]
        assert!(!CodecType::Opus.is_available());
    }

    #[cfg(feature = "opus-codec")]
    mod opus_tests {
        use super::*;

        #[test]
        fn test_opus_codec_roundtrip() {
            let config = CodecConfig {
                codec_type: CodecType::Opus,
                sample_rate: 48000,
                frame_size: 120, // 2.5ms
                channels: 1,
                bitrate: 128000,
            };

            let mut codec = OpusCodec::new(&config).unwrap();

            // Create test samples (sine wave)
            let samples: Vec<f32> = (0..120)
                .map(|i| (i as f32 * 2.0 * std::f32::consts::PI / 48.0).sin() * 0.5)
                .collect();

            // Encode
            let encoded = codec.encode(&samples).unwrap();
            // Opus should compress significantly
            assert!(encoded.len() < samples.len() * 4);

            // Decode
            let decoded = codec.decode(&encoded).unwrap();
            assert_eq!(decoded.len(), samples.len());
        }

        #[test]
        fn test_opus_plc() {
            let config = CodecConfig {
                codec_type: CodecType::Opus,
                sample_rate: 48000,
                frame_size: 120,
                channels: 1,
                bitrate: 128000,
            };

            let mut codec = OpusCodec::new(&config).unwrap();

            // First, decode a normal frame to initialize decoder state
            let samples: Vec<f32> = (0..120)
                .map(|i| (i as f32 * 2.0 * std::f32::consts::PI / 48.0).sin() * 0.5)
                .collect();
            let encoded = codec.encode(&samples).unwrap();
            let _ = codec.decode(&encoded).unwrap();

            // Now test PLC
            let plc_output = codec.decode_plc(120).unwrap();
            assert_eq!(plc_output.len(), 120);
        }
    }

    /// `decode_into` must produce exactly what `decode` produces, without
    /// allocating, and must refuse a buffer that is too small rather than
    /// truncating the frame.
    ///
    /// Verifies: REQ-AUD-023
    #[test]
    fn test_pcm_decode_into_matches_decode() {
        let config = CodecConfig {
            codec_type: CodecType::Pcm,
            channels: 1,
            frame_size: 8,
            ..Default::default()
        };
        let mut codec = PcmCodec::new(&config);

        let samples: Vec<f32> = vec![0.0, 1.0, -1.0, 0.5, -0.5, 0.25, -0.25, 0.125];
        let encoded = codec.encode(&samples).expect("encode");

        let expected = codec.decode(&encoded).expect("decode");

        // A buffer larger than the frame must leave the tail untouched.
        let mut output = vec![f32::NAN; samples.len() + 3];
        let written = codec
            .decode_into(&encoded, &mut output)
            .expect("decode_into");

        assert_eq!(written, samples.len());
        assert_eq!(&output[..written], expected.as_slice());
        assert_eq!(&output[..written], samples.as_slice());
        assert!(
            output[written..].iter().all(|s| s.is_nan()),
            "decode_into must not write past the decoded frame"
        );

        // Too small: refuse rather than silently dropping samples.
        let mut small = vec![0.0f32; samples.len() - 1];
        assert!(matches!(
            codec.decode_into(&encoded, &mut small),
            Err(CodecError::InvalidFrameSize { .. })
        ));

        // Malformed payloads are rejected the same way `decode` rejects them.
        let mut output = vec![0.0f32; 8];
        assert!(codec.decode_into(&[0u8; 3], &mut output).is_err());
    }
}
