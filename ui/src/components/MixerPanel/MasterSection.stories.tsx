import type { Meta, StoryObj } from "@storybook/react-vite";
import { MasterSection } from "./MasterSection";

const meta = {
  title: "Components/Mixer/MasterSection",
  component: MasterSection,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "208px", background: "var(--color-bg-secondary)", padding: "16px" }}>
        <Story />
      </div>
    ),
  ],
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
    isMuted: {
      control: "boolean",
      description: "Whether the master output is muted",
    },
  },
} satisfies Meta<typeof MasterSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    levelL: 75,
    levelR: 70,
    isMuted: false,
  },
};

export const LowLevel: Story = {
  args: {
    levelL: 30,
    levelR: 25,
    isMuted: false,
  },
};

export const HighLevel: Story = {
  args: {
    levelL: 95,
    levelR: 92,
    isMuted: false,
  },
};

export const Silence: Story = {
  args: {
    levelL: 0,
    levelR: 0,
    isMuted: false,
  },
};

export const Muted: Story = {
  args: {
    levelL: 75,
    levelR: 70,
    isMuted: true,
  },
};
