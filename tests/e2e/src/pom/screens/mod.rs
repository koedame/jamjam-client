//! One page object per screen the user sees.
//!
//! Each exposes the operations available on that screen and the states it
//! can be observed in. Selectors live here and nowhere else.

mod connection;
mod session;
mod settings;

pub use connection::{ConnectionScreen, ConnectionState};
pub use session::SessionScreen;
pub use settings::{DevicesTab, DiagnosticsTab, SettingsScreen, SettingsTab};

/// Tauri window labels, mirroring `src-tauri/src/windows.rs`'s `labels`.
pub(crate) mod windows {
    pub const SETTINGS: &str = "settings";
}
