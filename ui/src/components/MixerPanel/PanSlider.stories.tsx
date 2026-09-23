import type { Meta, StoryObj } from "@storybook/react-vite";
import { PanSlider } from "./PanSlider";

const meta = {
  title: "Components/Mixer/PanSlider",
  component: PanSlider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: -100, max: 100, step: 1 },
      description: "Pan value (-100 to 100)",
    },
    onChange: {
      action: "changed",
      description: "Callback when pan changes",
    },
    label: {
      control: "text",
      description: "Accessible label for the slider",
    },
  },
} satisfies Meta<typeof PanSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Center: Story = {
  args: {
    value: 0,
    label: "Channel 1 pan",
  },
};

export const Left: Story = {
  args: {
    value: -100,
    label: "Channel 1 pan",
  },
};

export const Right: Story = {
  args: {
    value: 100,
    label: "Channel 1 pan",
  },
};

export const SlightlyLeft: Story = {
  args: {
    value: -30,
    label: "Channel 1 pan",
  },
};

export const SlightlyRight: Story = {
  args: {
    value: 30,
    label: "Channel 1 pan",
  },
};
