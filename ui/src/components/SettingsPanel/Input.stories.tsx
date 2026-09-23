import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "Components/Settings/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "300px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithValue: Story = {
  args: {
    value: "User Name",
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Display name...",
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
    placeholder: "Enter name...",
  },
};

export const Disabled: Story = {
  args: {
    value: "Disabled input",
    disabled: true,
  },
};

export const MaxLength: Story = {
  args: {
    placeholder: "Max 32 chars...",
    maxLength: 32,
  },
};
