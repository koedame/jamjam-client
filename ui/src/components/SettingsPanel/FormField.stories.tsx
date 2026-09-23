import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField } from "./FormField";
import { Input } from "./Input";
import { Select } from "./Select";

const meta = {
  title: "Components/Settings/FormField",
  component: FormField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "450px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInput: Story = {
  args: {
    label: "Display Name",
    htmlFor: "name-input",
    children: <Input id="name-input" placeholder="Enter name..." />,
  },
};

export const WithHint: Story = {
  args: {
    label: "Display Name",
    htmlFor: "name-input",
    hint: "This name will be shown to other participants",
    children: <Input id="name-input" placeholder="Enter name..." />,
  },
};

export const WithError: Story = {
  args: {
    label: "Display Name",
    htmlFor: "name-input",
    error: "Name is required",
    children: <Input id="name-input" hasError />,
  },
};

export const WithSelect: Story = {
  args: {
    label: "Theme",
    htmlFor: "theme-select",
    children: (
      <Select
        id="theme-select"
        options={[
          { value: "dark", label: "Dark" },
          { value: "light", label: "Light" },
          { value: "system", label: "System" },
        ]}
        value="dark"
      />
    ),
  },
};

export const JapaneseLabels: Story = {
  args: {
    label: "表示名",
    htmlFor: "name-input",
    hint: "他の参加者に表示される名前です",
    children: <Input id="name-input" placeholder="名前を入力..." />,
  },
};

/** Row orientation: title + description on the left, control on the right. */
export const RowOrientation: Story = {
  args: {
    label: "サンプルレート",
    orientation: "row",
    description: "高いほど音質向上、帯域消費増加（推奨値=48kHz）",
    htmlFor: "sample-rate",
    children: (
      <Select
        id="sample-rate"
        variant="inline"
        options={[
          { value: "44100", label: "44.1kHz" },
          { value: "48000", label: "48kHz" },
          { value: "96000", label: "96kHz" },
        ]}
        value="48000"
      />
    ),
  },
};
