import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectionHistory } from "./ConnectionHistory";

const meta = {
  title: "Components/ConnectionHistory",
  component: ConnectionHistory,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "320px", background: "var(--color-bg-primary)", padding: "16px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof ConnectionHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleHistory = [
  { room_code: "ABC123", connected_at: new Date().toISOString(), label: "バンド練習" },
  {
    room_code: "XYZ789",
    connected_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    label: null,
  },
  {
    room_code: "HJK456",
    connected_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    label: "セッション",
  },
];

export const Default: Story = {
  args: {
    history: sampleHistory,
    onSelect: () => {},
    onRemove: () => {},
  },
};

/** Renders nothing when history is empty (see ConnectionHistory.tsx) - the
 * "no history" empty state is owned by the parent (ConnectionPanel). */
export const Empty: Story = {
  args: {
    history: [],
    onSelect: () => {},
    onRemove: () => {},
  },
};

export const Loading: Story = {
  args: {
    history: sampleHistory,
    onSelect: () => {},
    onRemove: () => {},
    isLoading: true,
  },
};
