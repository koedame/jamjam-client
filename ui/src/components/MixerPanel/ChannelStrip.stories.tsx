import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChannelStrip } from "./ChannelStrip";

const meta = {
  title: "Components/Mixer/ChannelStrip",
  component: ChannelStrip,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ display: "inline-flex", background: "var(--color-bg-primary)", padding: "16px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["local", "remote"],
      description: "Channel type",
    },
    levelL: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Left channel level (0-100)",
    },
    levelR: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Right channel level (0-100)",
    },
    volume: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Volume (0-100)",
    },
    pan: {
      control: { type: "range", min: -100, max: 100, step: 1 },
      description: "Pan (-100 to 100)",
    },
    isMuted: {
      control: "boolean",
      description: "Whether the channel is muted",
    },
    onVolumeChange: {
      action: "volumeChanged",
    },
    onPanChange: {
      action: "panChanged",
    },
    onMuteToggle: {
      action: "muteToggled",
    },
    isMonitoring: {
      control: "boolean",
      description: "Whether the user hears their own input directly (local channel only)",
    },
    onMonitorToggle: {
      action: "monitorToggled",
    },
  },
} satisfies Meta<typeof ChannelStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Local: Story = {
  args: {
    id: "local-1",
    name: "My Microphone",
    type: "local",
    sampleRate: 48000,
    channelCount: 2,
    levelL: 70,
    levelR: 65,
    volume: 80,
    pan: 0,
    isMuted: false,
  },
};

/**
 * The local strip with the monitor button, off
 */
export const LocalWithMonitor: Story = {
  args: {
    ...Local.args,
    isMonitoring: false,
    onMonitorToggle: () => {},
  },
};

/**
 * The local strip while the user hears their own input
 */
export const LocalMonitoring: Story = {
  args: {
    ...Local.args,
    isMonitoring: true,
    onMonitorToggle: () => {},
  },
};

export const Remote: Story = {
  args: {
    id: "remote-1",
    name: "Alice",
    type: "remote",
    sampleRate: 48000,
    channelCount: 2,
    levelL: 60,
    levelR: 55,
    volume: 75,
    pan: -20,
    isMuted: false,
  },
};

export const Muted: Story = {
  args: {
    id: "remote-2",
    name: "Bob",
    type: "remote",
    sampleRate: 48000,
    channelCount: 2,
    levelL: 50,
    levelR: 45,
    volume: 70,
    pan: 20,
    isMuted: true,
  },
};

export const MonoChannel: Story = {
  args: {
    id: "remote-3",
    name: "Charlie",
    type: "remote",
    sampleRate: 44100,
    channelCount: 1,
    levelL: 65,
    levelR: 65,
    volume: 85,
    pan: 0,
    isMuted: false,
  },
};

export const HighLevel: Story = {
  args: {
    id: "local-2",
    name: "Hot Signal",
    type: "local",
    sampleRate: 96000,
    channelCount: 2,
    levelL: 95,
    levelR: 92,
    volume: 100,
    pan: 0,
    isMuted: false,
  },
};
