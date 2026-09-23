import type { Meta, StoryObj } from "@storybook/react-vite";
import { StereoMeter } from "./StereoMeter";

const meta = {
  title: "Components/Mixer/StereoMeter",
  component: StereoMeter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    levelL: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Left channel level (0-100)",
    },
    levelR: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Right channel level (0-100)",
    },
    height: {
      control: { type: "number", min: 50, max: 400 },
      description: "Height in pixels",
    },
    isMuted: {
      control: "boolean",
      description: "Whether the channel is muted",
    },
  },
} satisfies Meta<typeof StereoMeter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    levelL: 70,
    levelR: 65,
    height: 160,
  },
};

export const LowLevel: Story = {
  args: {
    levelL: 30,
    levelR: 25,
    height: 160,
  },
};

export const HighLevel: Story = {
  args: {
    levelL: 95,
    levelR: 90,
    height: 160,
  },
};

export const Muted: Story = {
  args: {
    levelL: 70,
    levelR: 65,
    height: 160,
    isMuted: true,
  },
};

export const Asymmetric: Story = {
  args: {
    levelL: 90,
    levelR: 30,
    height: 160,
  },
};

export const Tall: Story = {
  args: {
    levelL: 70,
    levelR: 65,
    height: 300,
  },
};

export const Short: Story = {
  args: {
    levelL: 70,
    levelR: 65,
    height: 80,
  },
};
