/**
 * MixerPanel component exports
 */

// Main component
export { MixerPanel, default } from "./MixerPanel";
export type { MixerPanelProps, Channel } from "./MixerPanel";

// Sub-components
export { ChannelStrip } from "./ChannelStrip";
export type { ChannelStripProps, ChannelType } from "./ChannelStrip";

export { MasterSection } from "./MasterSection";
export type { MasterSectionProps } from "./MasterSection";

export { StereoMeter } from "./StereoMeter";
export type { StereoMeterProps } from "./StereoMeter";

export { StereoFader } from "./StereoFader";
export type { StereoFaderProps } from "./StereoFader";

export { PanSlider } from "./PanSlider";
export type { PanSliderProps } from "./PanSlider";

export { AudioQualityBadge } from "./AudioQualityBadge";
export type { AudioQualityBadgeProps } from "./AudioQualityBadge";

export { usePeakHold } from "./usePeakHold";
