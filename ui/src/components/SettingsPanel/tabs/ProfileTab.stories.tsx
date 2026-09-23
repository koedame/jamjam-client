import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileTab } from "./ProfileTab";

const meta = {
  title: "Components/Settings/Tabs/ProfileTab",
  component: ProfileTab,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "450px", background: "var(--color-bg-primary)", padding: "16px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    displayName: "山田太郎",
    onDisplayNameChange: () => {},
  },
};

export const Empty: Story = {
  args: {
    displayName: "",
    onDisplayNameChange: () => {},
  },
};

export const Error: Story = {
  args: {
    displayName: "",
    error: "表示名を入力してください",
    onDisplayNameChange: () => {},
  },
};
