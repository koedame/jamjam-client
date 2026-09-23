import type { Meta, StoryObj } from "@storybook/react-vite";
import { StereoFader } from "./StereoFader";

const meta = {
  title: "Components/Mixer/StereoFader",
  component: StereoFader,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    volume: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Volume level (0-100)",
    },
    height: {
      control: { type: "number", min: 50, max: 400 },
      description: "Height in pixels",
    },
    onChange: {
      action: "changed",
      description: "Callback when volume changes",
    },
    label: {
      control: "text",
      description: "Accessible label for the slider",
    },
  },
} satisfies Meta<typeof StereoFader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    volume: 80,
    height: 160,
    label: "Channel 1 volume",
  },
};

export const Zero: Story = {
  args: {
    volume: 0,
    height: 160,
    label: "Channel 1 volume",
  },
};

export const Max: Story = {
  args: {
    volume: 100,
    height: 160,
    label: "Channel 1 volume",
  },
};

export const Mid: Story = {
  args: {
    volume: 50,
    height: 160,
    label: "Channel 1 volume",
  },
};

export const Tall: Story = {
  args: {
    volume: 80,
    height: 300,
    label: "Channel 1 volume",
  },
};

export const Short: Story = {
  args: {
    volume: 80,
    height: 80,
    label: "Channel 1 volume",
  },
};
