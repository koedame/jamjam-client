import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ReactionBar } from "./ReactionBar";

const meta = {
  title: "Components/Chat/ReactionBar",
  component: ReactionBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ReactionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    reactions: [
      { emoji: "👍", count: 3, isActive: false },
      { emoji: "❤️", count: 2, isActive: true },
      { emoji: "😄", count: 1, isActive: false },
    ],
    onReactionClick: fn(),
  },
};

export const SingleReaction: Story = {
  args: {
    reactions: [{ emoji: "👍", count: 5, isActive: false }],
    onReactionClick: fn(),
  },
};

export const ManyReactions: Story = {
  args: {
    reactions: [
      { emoji: "👍", count: 12, isActive: true },
      { emoji: "❤️", count: 8, isActive: false },
      { emoji: "😄", count: 5, isActive: false },
      { emoji: "🎵", count: 3, isActive: true },
      { emoji: "👏", count: 2, isActive: false },
      { emoji: "🔥", count: 1, isActive: false },
    ],
    onReactionClick: fn(),
  },
};

export const AllActive: Story = {
  args: {
    reactions: [
      { emoji: "👍", count: 1, isActive: true },
      { emoji: "❤️", count: 1, isActive: true },
      { emoji: "😄", count: 1, isActive: true },
    ],
    onReactionClick: fn(),
  },
};

export const Disabled: Story = {
  args: {
    reactions: [
      { emoji: "👍", count: 3, isActive: false },
      { emoji: "❤️", count: 2, isActive: true },
    ],
    disabled: true,
  },
};

export const Empty: Story = {
  args: {
    reactions: [],
    onReactionClick: fn(),
  },
};
