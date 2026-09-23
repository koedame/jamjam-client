/**
 * SettingsScreen - Settings window using Storybook SettingsPanel
 *
 * Reuses the SettingsPanelAdapter component for consistent UI between
 * Storybook and Tauri GUI.
 * Diagnostics are integrated into the Diagnostics tab within SettingsPanel.
 */

import { SettingsPanelAdapter } from "../components/SettingsPanel";

export function SettingsScreen() {
  return <SettingsPanelAdapter initialTab="general" />;
}

export default SettingsScreen;
