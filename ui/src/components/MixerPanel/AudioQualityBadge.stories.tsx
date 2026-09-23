import type { Meta, StoryObj } from "@storybook/react-vite";
import { AudioQualityBadge } from "./AudioQualityBadge";

const meta = {
  title: "Components/Mixer/AudioQualityBadge",
  component: AudioQualityBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    sampleRate: {
      control: { type: "select" },
      options: [44100, 48000, 88200, 96000],
      description: "Sample rate in Hz",
    },
    channels: {
      control: { type: "select" },
      options: [1, 2],
      description: "Number of channels",
    },
  },
} satisfies Meta<typeof AudioQualityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sampleRate: 48000,
    channels: 2,
  },
};

export const Mono: Story = {
  args: {
    sampleRate: 48000,
    channels: 1,
  },
};

export const HighRes: Story = {
  args: {
    sampleRate: 96000,
    channels: 2,
  },
};

export const CD: Story = {
  args: {
    sampleRate: 44100,
    channels: 2,
  },
};
