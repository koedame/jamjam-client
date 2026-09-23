import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { EmojiPicker } from "./EmojiPicker";

const meta = {
  title: "Components/Chat/EmojiPicker",
  component: EmojiPicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EmojiPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSelect: fn(),
    onClose: fn(),
  },
};

export const WithRecentEmojis: Story = {
  args: {
    recentEmojis: ["👍", "❤️", "😄", "🎵", "👏", "🔥", "✨", "🎉"],
    onSelect: fn(),
    onClose: fn(),
  },
};

export const NoCloseButton: Story = {
  args: {
    onSelect: fn(),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onSelect: fn(),
    onClose: fn(),
  },
};
