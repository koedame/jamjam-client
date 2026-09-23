import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { MessageActions } from "./MessageActions";

const meta = {
  title: "Components/Chat/MessageActions",
  component: MessageActions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onReaction: fn(),
  },
};

export const WithRecentEmojis: Story = {
  args: {
    onReaction: fn(),
    recentEmojis: ["🔥", "✨", "🎉", "💯", "🙌"],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
