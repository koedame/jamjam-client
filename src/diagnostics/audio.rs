//! Audio diagnostics for jamjam
//!
//! Provides audio device checks including:
//! - Input/output device detection and capabilities
//! - Low-latency support detection (ASIO, CoreAudio exclusive)
//! - Buffer size compatibility
//! - Sample rate support

use serde::{Deserialize, Serialize};
use tracing::warn;

use super::{DiagnosticGrade, DiagnosticProblem, ProblemCode, ProblemSeverity};
use crate::audio::{
    list_input_devices, list_output_devices, resolve_input_device, resolve_output_device,
    stable_device_id, AudioDevice, DeviceId,
};

/// Diagnostics for a single audio device
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceDiagnostics {
    /// Device ID
    pub id: String,
    /// Device name
    pub name: String,
    /// Whether this is the default device
    pub is_default: bool,
    /// Whether this is an ASIO device (Windows)
    pub is_asio: bool,
    /// Supported sample rates
    pub supported_sample_rates: Vec<u32>,
    /// Whether 48kHz is supported (required for jamjam)
    pub supports_48khz: bool,
    /// Supported channel counts
    pub supported_channels: Vec<u16>,
    /// Diagnostic grade for this device
    pub grade: DiagnosticGrade,
}

impl DeviceDiagnostics {
    /// Create diagnostics from an audio device
    fn from_audio_device(info: &AudioDevice) -> Self {
        let supports_48khz = info.supported_sample_rates.contains(&48000);

        // Calculate grade based on capabilities
        // On macOS, CoreAudio is the low-latency API (equivalent to ASIO on Windows)
        // On Linux, PipeWire/JACK provide low-latency audio
        #[cfg(any(target_os = "macos", target_os = "linux"))]
        let grade = if supports_48khz {
            // 48kHz support is sufficient for A grade on macOS/Linux
            DiagnosticGrade::A
        } else {
            // Doesn't support 48kHz
            DiagnosticGrade::C
        };

        #[cfg(target_os = "windows")]
        let grade = if info.is_asio && supports_48khz {
            // ASIO with 48kHz support is ideal on Windows
            DiagnosticGrade::A
        } else if supports_48khz {
            // Non-ASIO but supports 48kHz - WASAPI shared mode
            DiagnosticGrade::B
        } else {
            // Doesn't support 48kHz
            DiagnosticGrade::C
        };

        #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
        let grade = if supports_48khz {
            DiagnosticGrade::B
        } else {
            DiagnosticGrade::C
        };

        DeviceDiagnostics {
            id: info.id.0.clone(),
            name: info.name.clone(),
            is_default: info.is_default,
            is_asio: info.is_asio,
            supported_sample_rates: info.supported_sample_rates.clone(),
            supports_48khz,
            supported_channels: info.supported_channels.clone(),
            grade,
        }
    }
}

/// Low-latency support detection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LowLatencySupport {
    /// Whether ASIO is available (Windows)
    pub asio_available: bool,
    /// List of available ASIO devices
    pub asio_devices: Vec<String>,
    /// Whether the selected device supports 32-sample buffers
    pub supports_32_samples: bool,
    /// Whether the selected device supports 64-sample buffers
    pub supports_64_samples: bool,
    /// Whether the selected device supports 128-sample buffers
    pub supports_128_samples: bool,
    /// Minimum supported buffer size in samples
    pub min_buffer_size: Option<u32>,
    /// Estimated minimum latency in milliseconds (at 48kHz)
    pub estimated_min_latency_ms: Option<f64>,
}

impl Default for LowLatencySupport {
    fn default() -> Self {
        Self {
            asio_available: false,
            asio_devices: Vec::new(),
            supports_32_samples: false,
            supports_64_samples: false,
            supports_128_samples: true, // Assume most devices support 128
            min_buffer_size: Some(128),
            estimated_min_latency_ms: Some(2.67), // 128 samples at 48kHz
        }
    }
}

/// Where a diagnosed device came from
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DeviceSource {
    /// Matches the device id configured in Settings
    Configured,
    /// Settings has no device configured, so the OS default was used
    OsDefault,
}

/// Complete audio diagnostics result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDiagnosticsResult {
    /// Available input devices
    pub input_devices: Vec<DeviceDiagnostics>,
    /// Available output devices
    pub output_devices: Vec<DeviceDiagnostics>,
    /// Diagnostics for the input device streaming would actually use
    pub selected_input: Option<DeviceDiagnostics>,
    /// Diagnostics for the output device streaming would actually use
    pub selected_output: Option<DeviceDiagnostics>,
    /// Whether `selected_input` is the configured device or the OS default
    pub input_source: DeviceSource,
    /// Whether `selected_output` is the configured device or the OS default
    pub output_source: DeviceSource,
    /// Low-latency support information
    pub low_latency_support: LowLatencySupport,
    /// Overall audio grade
    pub overall_grade: DiagnosticGrade,
    /// Detected problems
    pub problems: Vec<DiagnosticProblem>,
}

/// Audio diagnostics runner
pub struct AudioDiagnostics;

impl AudioDiagnostics {
    /// Run all audio diagnostics against the devices Settings has configured
    /// (`None` means Settings has nothing configured, so the OS default is
    /// used). Resolves through `resolve_input_device`/`resolve_output_device`,
    /// the same functions `streaming_start` uses, so the diagnostics tab
    /// reports on the device a call would actually use, not a different one.
    pub fn run(
        configured_input: Option<&str>,
        configured_output: Option<&str>,
    ) -> AudioDiagnosticsResult {
        let mut problems = Vec::new();

        // Get input devices
        let input_devices: Vec<DeviceDiagnostics> = match list_input_devices() {
            Ok(devices) => devices
                .iter()
                .map(DeviceDiagnostics::from_audio_device)
                .collect(),
            Err(e) => {
                warn!("Failed to list input devices: {}", e);
                problems.push(DiagnosticProblem {
                    severity: ProblemSeverity::Error,
                    category: "audio".to_string(),
                    code: ProblemCode::InputEnumerationFailed {
                        error: e.to_string(),
                    },
                });
                Vec::new()
            }
        };

        // Get output devices
        let output_devices: Vec<DeviceDiagnostics> = match list_output_devices() {
            Ok(devices) => devices
                .iter()
                .map(DeviceDiagnostics::from_audio_device)
                .collect(),
            Err(e) => {
                warn!("Failed to list output devices: {}", e);
                problems.push(DiagnosticProblem {
                    severity: ProblemSeverity::Error,
                    category: "audio".to_string(),
                    code: ProblemCode::OutputEnumerationFailed {
                        error: e.to_string(),
                    },
                });
                Vec::new()
            }
        };

        // Resolve the input/output device the same way `streaming_start`
        // would: the configured id if there is one, otherwise the OS default.
        let configured_input_id = configured_input.map(|id| DeviceId(id.to_string()));
        let configured_output_id = configured_output.map(|id| DeviceId(id.to_string()));

        let selected_input = resolve_input_device(configured_input_id.as_ref())
            .ok()
            .and_then(|device| stable_device_id(&device))
            .and_then(|id| input_devices.iter().find(|d| d.id == id).cloned());
        let selected_output = resolve_output_device(configured_output_id.as_ref())
            .ok()
            .and_then(|device| stable_device_id(&device))
            .and_then(|id| output_devices.iter().find(|d| d.id == id).cloned());

        let input_source = if configured_input.is_some() {
            DeviceSource::Configured
        } else {
            DeviceSource::OsDefault
        };
        let output_source = if configured_output.is_some() {
            DeviceSource::Configured
        } else {
            DeviceSource::OsDefault
        };

        // Check for no devices
        if input_devices.is_empty() {
            problems.push(DiagnosticProblem {
                severity: ProblemSeverity::Error,
                category: "audio".to_string(),
                code: ProblemCode::NoInputDevices,
            });
        }

        if output_devices.is_empty() {
            problems.push(DiagnosticProblem {
                severity: ProblemSeverity::Error,
                category: "audio".to_string(),
                code: ProblemCode::NoOutputDevices,
            });
        }

        // Check 48kHz support
        if let Some(ref input) = selected_input {
            if !input.supports_48khz {
                problems.push(DiagnosticProblem {
                    severity: ProblemSeverity::Warning,
                    category: "audio".to_string(),
                    code: ProblemCode::InputNot48kHz {
                        device_name: input.name.clone(),
                    },
                });
            }
        }

        if let Some(ref output) = selected_output {
            if !output.supports_48khz {
                problems.push(DiagnosticProblem {
                    severity: ProblemSeverity::Warning,
                    category: "audio".to_string(),
                    code: ProblemCode::OutputNot48kHz {
                        device_name: output.name.clone(),
                    },
                });
            }
        }

        // Detect low-latency support
        let low_latency_support = Self::detect_low_latency_support(&input_devices, &output_devices);

        // Add problems for limited low-latency support
        if !low_latency_support.supports_32_samples && !low_latency_support.supports_64_samples {
            problems.push(DiagnosticProblem {
                severity: ProblemSeverity::Warning,
                category: "audio".to_string(),
                code: ProblemCode::LowBufferUnsupported,
            });
        }

        #[cfg(target_os = "windows")]
        if !low_latency_support.asio_available {
            problems.push(DiagnosticProblem {
                severity: ProblemSeverity::Info,
                category: "audio".to_string(),
                code: ProblemCode::NoAsioDevices,
            });
        }

        // Calculate overall grade
        let overall_grade =
            Self::calculate_overall_grade(&selected_input, &selected_output, &low_latency_support);

        AudioDiagnosticsResult {
            input_devices,
            output_devices,
            selected_input,
            selected_output,
            input_source,
            output_source,
            low_latency_support,
            overall_grade,
            problems,
        }
    }

    /// Detect low-latency support
    fn detect_low_latency_support(
        input_devices: &[DeviceDiagnostics],
        output_devices: &[DeviceDiagnostics],
    ) -> LowLatencySupport {
        // Check for ASIO devices
        let asio_devices: Vec<String> = input_devices
            .iter()
            .chain(output_devices.iter())
            .filter(|d| d.is_asio)
            .map(|d| d.name.clone())
            .collect();
        let asio_available = !asio_devices.is_empty();

        // Determine buffer size support
        // This is platform-dependent and device-dependent
        // For now, we make conservative estimates

        #[cfg(target_os = "macos")]
        let (supports_32, supports_64, min_buffer) = {
            // macOS CoreAudio generally supports low buffer sizes
            (true, true, Some(32u32))
        };

        #[cfg(target_os = "windows")]
        let (supports_32, supports_64, min_buffer) = {
            if asio_available {
                // ASIO typically supports very low buffer sizes
                (true, true, Some(32u32))
            } else {
                // WASAPI shared mode has higher minimum
                (false, true, Some(64u32))
            }
        };

        #[cfg(target_os = "linux")]
        let (supports_32, supports_64, min_buffer) = {
            // Linux with PipeWire/JACK can support low latency
            (true, true, Some(32u32))
        };

        #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
        let (supports_32, supports_64, min_buffer) = {
            // Unknown platform, conservative estimate
            (false, false, Some(128u32))
        };

        // Calculate estimated minimum latency
        let estimated_min_latency_ms = min_buffer.map(|b| b as f64 / 48.0); // samples / (kHz)

        LowLatencySupport {
            asio_available,
            asio_devices,
            supports_32_samples: supports_32,
            supports_64_samples: supports_64,
            supports_128_samples: true,
            min_buffer_size: min_buffer,
            estimated_min_latency_ms,
        }
    }

    /// Calculate overall audio grade
    fn calculate_overall_grade(
        selected_input: &Option<DeviceDiagnostics>,
        selected_output: &Option<DeviceDiagnostics>,
        low_latency_support: &LowLatencySupport,
    ) -> DiagnosticGrade {
        // If we have no devices, grade is C
        if selected_input.is_none() || selected_output.is_none() {
            return DiagnosticGrade::C;
        }

        let input_grade = selected_input
            .as_ref()
            .map(|d| d.grade)
            .unwrap_or(DiagnosticGrade::C);
        let output_grade = selected_output
            .as_ref()
            .map(|d| d.grade)
            .unwrap_or(DiagnosticGrade::C);

        // Low-latency bonus
        let latency_bonus = if low_latency_support.supports_32_samples {
            20
        } else if low_latency_support.supports_64_samples {
            10
        } else {
            0
        };

        let total_score = (input_grade.to_score() + output_grade.to_score()) / 2 + latency_bonus;

        if total_score >= 90 {
            DiagnosticGrade::A
        } else if total_score >= 70 {
            DiagnosticGrade::B
        } else {
            DiagnosticGrade::C
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_low_latency_support_default() {
        let support = LowLatencySupport::default();
        assert!(support.supports_128_samples);
        assert!(!support.asio_available);
    }

    #[test]
    fn test_diagnostic_grade_scoring() {
        assert_eq!(DiagnosticGrade::A.to_score(), 100);
        assert_eq!(DiagnosticGrade::B.to_score(), 75);
        assert_eq!(DiagnosticGrade::C.to_score(), 50);
    }

    /// Reports the source as configured/OS-default independent of whether any
    /// audio hardware is present, so this runs everywhere.
    #[test]
    fn test_run_reports_configured_source_when_a_device_id_is_given() {
        let result = AudioDiagnostics::run(Some("nonexistent-device-id"), None);
        assert_eq!(result.input_source, DeviceSource::Configured);
        assert_eq!(result.output_source, DeviceSource::OsDefault);
    }

    #[test]
    fn test_run_reports_os_default_source_when_no_device_is_configured() {
        let result = AudioDiagnostics::run(None, None);
        assert_eq!(result.input_source, DeviceSource::OsDefault);
        assert_eq!(result.output_source, DeviceSource::OsDefault);
    }

    /// Proves diagnostics reports the *configured* device, not always the OS
    /// default, which is the regression this test guards against. Needs at
    /// least one non-default device to make the two distinguishable, so it
    /// skips on machines/CI runners with only one device or none - the GUI
    /// e2e suite covers this with the ALSA/PipeWire virtual devices set up by
    /// `tests/e2e/scripts/setup-virtual-audio-linux.sh`.
    #[test]
    fn test_run_selects_configured_device_over_os_default_when_they_differ() {
        let inputs = list_input_devices().unwrap_or_default();
        let Some(non_default) = inputs.iter().find(|d| !d.is_default) else {
            eprintln!("skipping: no non-default input device available in this environment");
            return;
        };

        let result = AudioDiagnostics::run(Some(non_default.id.0.as_str()), None);

        assert_eq!(
            result.selected_input.map(|d| d.id),
            Some(non_default.id.0.clone()),
            "diagnostics must report the configured device, not the OS default"
        );
        assert_eq!(result.input_source, DeviceSource::Configured);
    }
}
