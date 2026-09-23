import type { Meta, StoryObj } from "@storybook/react-vite";
import { GeneralTab } from "./GeneralTab";

const meta = {
  title: "Components/Settings/Tabs/GeneralTab",
  component: GeneralTab,
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
} satisfies Meta<typeof GeneralTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Japanese: Story = {
  args: {
    language: "ja",
    onLanguageChange: () => {},
    serverUrl: "",
    effectiveServerUrl: "signaling.example.com",
    onServerUrlChange: () => {},
  },
};

export const English: Story = {
  args: {
    language: "en",
    onLanguageChange: () => {},
    serverUrl: "",
    effectiveServerUrl: "signaling.example.com",
    onServerUrlChange: () => {},
  },
};

/** A leftover dev/test URL is still configured - the hint calls it out. */
export const CustomServer: Story = {
  args: {
    language: "en",
    onLanguageChange: () => {},
    serverUrl: "signaling.example.com",
    effectiveServerUrl: "signaling.example.com",
    onServerUrlChange: () => {},
  },
};
