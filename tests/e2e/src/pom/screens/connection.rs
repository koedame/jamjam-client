//! The connection window - the first thing the user sees on launch.

use crate::pom::driver::{Driver, DriverResult};
use crate::pom::element::Element;

const ROOT: &str = "[data-testid='connection-panel']";

/// The states the connection screen presents to the user. Read from the
/// screen itself (`data-state`) rather than inferred from which elements
/// happen to be on screen, so a test cannot mistake "still rendering" for a
/// settled state.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConnectionState {
    Idle,
    Connecting,
    Error,
}

pub struct ConnectionScreen<'a> {
    driver: &'a Driver,
}

impl<'a> ConnectionScreen<'a> {
    pub(crate) fn new(driver: &'a Driver) -> Self {
        Self { driver }
    }

    fn element(&self, selector: &'static str, name: &'static str) -> Element<'a> {
        Element::new(self.driver, selector, None, name)
    }

    pub fn is_displayed(&self) -> DriverResult<bool> {
        self.element(ROOT, "connection screen").is_visible()
    }

    pub fn wait_until_displayed(&self, timeout: std::time::Duration) -> DriverResult<()> {
        self.element(ROOT, "connection screen")
            .wait_until_visible(timeout)
    }

    /// Waits until the screen has settled into a state the user can act on.
    ///
    /// While connecting, the panel renders a loading variant with no form at
    /// all, so anything that types or clicks must wait this out first -
    /// otherwise the test races the app's start-up auto-connect and fails
    /// for reasons that have nothing to do with what it is checking.
    pub fn wait_until_interactive(&self, timeout: std::time::Duration) -> DriverResult<()> {
        self.wait_until_displayed(timeout)?;
        crate::pom::wait_for(timeout, || {
            matches!(
                self.state(),
                Ok(ConnectionState::Idle) | Ok(ConnectionState::Error)
            )
        })
        .map_err(|_| {
            format!(
                "connection screen was still connecting after {:?}; the form never appeared",
                timeout
            )
        })
    }

    pub fn state(&self) -> DriverResult<ConnectionState> {
        let result = self
            .driver
            .query("[data-testid='connection-panel'][data-state='idle']", None)?;
        if result.exists {
            return Ok(ConnectionState::Idle);
        }
        let connecting = self.driver.query(
            "[data-testid='connection-panel'][data-state='connecting']",
            None,
        )?;
        if connecting.exists {
            return Ok(ConnectionState::Connecting);
        }
        let error = self
            .driver
            .query("[data-testid='connection-panel'][data-state='error']", None)?;
        if error.exists {
            return Ok(ConnectionState::Error);
        }
        Err("connection screen is not showing any known state".to_string())
    }

    // --- what the user can operate ---

    pub fn create_room_button(&self) -> Element<'a> {
        self.element(
            "[data-testid='connection-panel-create-room']",
            "Create Room button",
        )
    }

    pub fn invite_code_input(&self) -> Element<'a> {
        self.element(
            "[data-testid='connection-panel-invite-code']",
            "invite code input",
        )
    }

    pub fn join_button(&self) -> Element<'a> {
        self.element("[data-testid='connection-panel-join']", "Join button")
    }

    pub fn settings_button(&self) -> Element<'a> {
        self.element(
            "[data-testid='connection-panel-settings']",
            "settings button",
        )
    }

    pub fn test_room_button(&self) -> Element<'a> {
        self.element(
            "[data-testid='connection-panel-test-room']",
            "test room shortcut",
        )
    }

    pub fn cancel_button(&self) -> Element<'a> {
        self.element("[data-testid='connection-panel-cancel']", "Cancel button")
    }

    // --- what the user can observe ---

    pub fn error_message(&self) -> Element<'a> {
        self.element("[data-testid='connection-panel-error']", "error message")
    }

    /// The banner shown when the app cannot reach the signaling server at
    /// all (as opposed to a room-level error like an unknown room).
    pub fn server_error(&self) -> Element<'a> {
        self.element(
            "[data-testid='connection-panel-server-error']",
            "server error banner",
        )
    }

    /// The signaling server URL named in the server error banner.
    pub fn server_error_url(&self) -> Element<'a> {
        self.element(
            "[data-testid='connection-panel-server-error-url']",
            "server error URL",
        )
    }

    /// The raw, untranslated error text in the server error banner.
    pub fn server_error_detail(&self) -> Element<'a> {
        self.element(
            "[data-testid='connection-panel-server-error-detail']",
            "server error detail",
        )
    }

    pub fn retry_button(&self) -> Element<'a> {
        self.element("[data-testid='connection-panel-retry']", "Retry button")
    }

    pub fn loading_indicator(&self) -> Element<'a> {
        self.element(
            "[data-testid='connection-panel-loading']",
            "loading indicator",
        )
    }

    /// Everything the screen currently reads out to the user.
    pub fn visible_text(&self) -> DriverResult<String> {
        self.element(ROOT, "connection screen").text()
    }

    /// Enters a code the way a user would: type, then press the button.
    pub fn join_with_code(&self, code: &str) -> DriverResult<()> {
        self.invite_code_input().type_text(code)?;
        self.join_button().click()
    }
}
