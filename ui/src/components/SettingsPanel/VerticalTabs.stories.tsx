import type { Meta, StoryObj } from "@storybook/react-vite";
import { VerticalTabs, Tab } from "./VerticalTabs";
import { MicIcon, SlidersIcon, UserIcon, ActivityIcon } from "./icons";

const meta = {
  title: "Components/Settings/VerticalTabs",
  component: VerticalTabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ height: "300px", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VerticalTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultTabs: Tab[] = [
  { id: "general", label: "General", icon: <SlidersIcon /> },
  { id: "devices", label: "Devices", icon: <MicIcon /> },
  { id: "profile", label: "Profile", icon: <UserIcon /> },
  { id: "diagnostics", label: "Diagnostics", icon: <ActivityIcon /> },
];

const japaneseTabs: Tab[] = [
  { id: "general", label: "一般", icon: <SlidersIcon /> },
  { id: "devices", label: "デバイス", icon: <MicIcon /> },
  { id: "profile", label: "プロフィール", icon: <UserIcon /> },
  { id: "diagnostics", label: "診断", icon: <ActivityIcon /> },
];

export const Default: Story = {
  args: {
    tabs: defaultTabs,
    selectedId: "devices",
    onSelect: () => {},
  },
};

export const ProfileSelected: Story = {
  args: {
    tabs: defaultTabs,
    selectedId: "profile",
    onSelect: () => {},
  },
};

export const DevicesSelected: Story = {
  args: {
    tabs: defaultTabs,
    selectedId: "devices",
    onSelect: () => {},
  },
};

export const JapaneseTabs: Story = {
  args: {
    tabs: japaneseTabs,
    selectedId: "devices",
    onSelect: () => {},
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      { id: "audio", label: "Audio" },
      { id: "video", label: "Video" },
    ],
    selectedId: "audio",
    onSelect: () => {},
  },
};
