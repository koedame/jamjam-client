import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, SelectOption } from "./Select";

const meta = {
  title: "Components/Settings/Select",
  component: Select,
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
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const themeOptions: SelectOption[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

const deviceOptions: SelectOption[] = [
  { value: "default", label: "Built-in Microphone (Default)" },
  { value: "usb", label: "USB Audio Device" },
  { value: "bluetooth", label: "Bluetooth Headset" },
];

const sampleRateOptions: SelectOption[] = [
  { value: "44100", label: "44.1 kHz" },
  { value: "48000", label: "48 kHz (Recommended)" },
  { value: "96000", label: "96 kHz" },
];

const bufferSizeOptions: SelectOption[] = [
  { value: "32", label: "32 samples (0.67ms)" },
  { value: "64", label: "64 samples (1.33ms)" },
  { value: "128", label: "128 samples (2.67ms)" },
  { value: "256", label: "256 samples (5.33ms)" },
];

export const Default: Story = {
  args: {
    options: themeOptions,
    value: "dark",
  },
};

export const WithPlaceholder: Story = {
  args: {
    options: deviceOptions,
    placeholder: "Select a device...",
    value: "",
  },
};

export const Disabled: Story = {
  args: {
    options: themeOptions,
    value: "dark",
    disabled: true,
  },
};

export const DeviceList: Story = {
  args: {
    options: deviceOptions,
    value: "default",
  },
};

export const SampleRateOptions: Story = {
  args: {
    options: sampleRateOptions,
    value: "48000",
  },
};

export const BufferSizeOptions: Story = {
  args: {
    options: bufferSizeOptions,
    value: "64",
  },
};

/** Inline variant: compact, accent-colored mono value (sample rate / buffer). */
export const InlineVariant: Story = {
  args: {
    variant: "inline",
    options: sampleRateOptions,
    value: "48000",
  },
};

/** Channel variant: compact field with an internal prefix label (L/R channels). */
export const ChannelVariant: Story = {
  args: {
    variant: "channel",
    prefixLabel: "L/MONO",
    options: [
      { value: "1", label: "Ch 1" },
      { value: "2", label: "Ch 2" },
    ],
    value: "1",
  },
};
