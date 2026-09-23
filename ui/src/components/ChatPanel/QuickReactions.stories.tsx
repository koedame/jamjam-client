import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { QuickReactions } from "./QuickReactions";

const meta = {
  title: "Components/Chat/QuickReactions",
  component: QuickReactions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof QuickReactions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSelect: fn(),
    onOpenPicker: fn(),
  },
};

export const WithoutMoreButton: Story = {
  args: {
    onSelect: fn(),
    showMoreButton: false,
  },
};

export const CustomEmojis: Story = {
  args: {
    quickEmojis: ["🎸", "🥁", "🎹", "🎤", "🎷"],
    onSelect: fn(),
    onOpenPicker: fn(),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
