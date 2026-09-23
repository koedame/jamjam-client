// Main component
export { SettingsPanel, type SettingsPanelProps, type SettingsTabId } from "./SettingsPanel";

// Adapter for Tauri integration
export { SettingsPanelAdapter, type SettingsPanelAdapterProps } from "./SettingsPanelAdapter";

// Sub components
export { VerticalTabs, type VerticalTabsProps, type Tab } from "./VerticalTabs";
export { FormField, type FormFieldProps } from "./FormField";
export { Select, type SelectProps, type SelectOption } from "./Select";
export { Input, type InputProps } from "./Input";

// Tab contents
export {
  GeneralTab,
  ProfileTab,
  DevicesTab,
  DiagnosticsTab,
  type GeneralTabProps,
  type ProfileTabProps,
  type DevicesTabProps,
  type DiagnosticsTabProps,
  type Language,
  type DeviceInfo,
} from "./tabs";
