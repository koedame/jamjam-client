import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ReactionButton } from "./ReactionButton";

const meta = {
  title: "Components/Chat/ReactionButton",
  component: ReactionButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ReactionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    emoji: "👍",
    count: 3,
    onClick: fn(),
  },
};

export const Active: Story = {
  args: {
    emoji: "❤️",
    count: 5,
    isActive: true,
    onClick: fn(),
  },
};

export const ZeroCount: Story = {
  args: {
    emoji: "😄",
    count: 0,
    onClick: fn(),
  },
};

export const HighCount: Story = {
  args: {
    emoji: "🎵",
    count: 99,
    onClick: fn(),
  },
};

export const Disabled: Story = {
  args: {
    emoji: "👏",
    count: 2,
    disabled: true,
  },
};

export const AllQuickReactions: Story = {
  args: {
    emoji: "👍",
    count: 3,
  },
  render: () => (
    <div style={{ display: "flex", gap: "8px" }}>
      <ReactionButton emoji="👍" count={3} onClick={fn()} />
      <ReactionButton emoji="❤️" count={5} isActive onClick={fn()} />
      <ReactionButton emoji="😄" count={1} onClick={fn()} />
      <ReactionButton emoji="🎵" count={2} onClick={fn()} />
      <ReactionButton emoji="👏" count={7} onClick={fn()} />
    </div>
  ),
};
