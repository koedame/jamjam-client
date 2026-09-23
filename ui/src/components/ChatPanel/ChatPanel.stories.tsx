import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ChatPanel } from "./ChatPanel";
import type { ChatMessageData } from "./ChatMessageList";

const meta = {
  title: "Windows/Chat",
  component: ChatPanel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        style={{
          width: "280px",
          height: "560px",
          background: "var(--color-bg-primary)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();

const sampleMessages: ChatMessageData[] = [
  {
    id: "1",
    type: "system",
    content: "セッションが開始されました",
    timestamp: now - 300000,
  },
  {
    id: "2",
    type: "system",
    content: "Alice が参加しました",
    timestamp: now - 290000,
  },
  {
    id: "3",
    type: "other",
    senderName: "Alice",
    content: "こんにちは！今日もよろしくお願いします。",
    timestamp: now - 280000,
  },
  {
    id: "4",
    type: "own",
    content: "よろしく！何から始める？",
    timestamp: now - 270000,
  },
  {
    id: "5",
    type: "other",
    senderName: "Alice",
    content:
      "BPM120のファンクでいこう！\n\nドラムは8ビートで、ベースはルート中心にお願いします。",
    timestamp: now - 260000,
  },
  {
    id: "6",
    type: "own",
    content: "OK、いいね！",
    timestamp: now - 250000,
  },
];

export const Default: Story = {
  args: {
    messages: sampleMessages,
    onSend: fn(),
    title: "チャット",
  },
};

export const Empty: Story = {
  args: {
    messages: [],
    onSend: fn(),
    title: "チャット",
    emptyMessage: "メッセージはまだありません",
  },
};

export const Disabled: Story = {
  args: {
    messages: sampleMessages,
    disabled: true,
    title: "チャット",
    placeholder: "接続されていません",
  },
};

export const NoSendCallback: Story = {
  args: {
    messages: sampleMessages,
    title: "チャット（読み取り専用）",
  },
};

export const EnglishLabels: Story = {
  args: {
    messages: [
      {
        id: "1",
        type: "system",
        content: "Session started",
        timestamp: now - 300000,
      },
      {
        id: "2",
        type: "system",
        content: "Alice joined",
        timestamp: now - 290000,
      },
      {
        id: "3",
        type: "other",
        senderName: "Alice",
        content: "Hey! Ready to jam?",
        timestamp: now - 280000,
      },
      {
        id: "4",
        type: "own",
        content: "Let's go! What tempo?",
        timestamp: now - 270000,
      },
    ],
    onSend: fn(),
    title: "Chat",
    placeholder: "Type a message...",
    emptyMessage: "No messages yet",
    locale: "en-US",
  },
};

const manyMessages: ChatMessageData[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  type: i % 5 === 0 ? "system" : i % 2 === 0 ? "own" : "other",
  senderName: i % 2 === 1 ? (i % 4 === 1 ? "Alice" : "Bob") : undefined,
  content:
    i % 5 === 0
      ? `システムメッセージ ${i + 1}`
      : i % 3 === 0
        ? `短い ${i + 1}`
        : `メッセージ ${i + 1}。これは長めのメッセージテストです。複数行の表示も確認しています。`,
  timestamp: now - (30 - i) * 60000,
})) as ChatMessageData[];

export const ManyMessages: Story = {
  args: {
    messages: manyMessages,
    onSend: fn(),
    title: "チャット",
  },
};

export const SessionExample: Story = {
  args: {
    messages: [
      {
        id: "1",
        type: "system",
        content: "セッション「日曜ジャムセッション」が開始されました",
        timestamp: now - 600000,
      },
      {
        id: "2",
        type: "system",
        content: "Alice（ドラム）が参加しました",
        timestamp: now - 590000,
      },
      {
        id: "3",
        type: "system",
        content: "Bob（ベース）が参加しました",
        timestamp: now - 580000,
      },
      {
        id: "4",
        type: "other",
        senderName: "Alice",
        content: "みんな揃った？",
        timestamp: now - 570000,
      },
      {
        id: "5",
        type: "other",
        senderName: "Bob",
        content: "ここにいるよ！",
        timestamp: now - 560000,
      },
      {
        id: "6",
        type: "own",
        content: "準備OK！",
        timestamp: now - 550000,
      },
      {
        id: "7",
        type: "other",
        senderName: "Alice",
        content:
          "じゃあまずはBPM100のブルースから始めよう。\n12小節のスタンダードな進行で。",
        timestamp: now - 540000,
      },
      {
        id: "8",
        type: "other",
        senderName: "Bob",
        content: "👍 ルートで入るね",
        timestamp: now - 530000,
      },
      {
        id: "9",
        type: "own",
        content: "了解、コードは任せて",
        timestamp: now - 520000,
      },
      {
        id: "10",
        type: "other",
        senderName: "Alice",
        content: "3、2、1...スタート！",
        timestamp: now - 510000,
      },
    ],
    onSend: fn(),
    title: "日曜ジャムセッション",
  },
};

export const WithReactions: Story = {
  args: {
    messages: [
      {
        id: "1",
        type: "system",
        content: "セッションが開始されました",
        timestamp: now - 300000,
      },
      {
        id: "2",
        type: "other",
        senderName: "Alice",
        content: "今日のセッション楽しかった！",
        timestamp: now - 280000,
        reactions: [
          { emoji: "👍", count: 2, isActive: true },
          { emoji: "❤️", count: 1, isActive: false },
        ],
      },
      {
        id: "3",
        type: "own",
        content: "また来週もやろう！",
        timestamp: now - 270000,
        reactions: [
          { emoji: "👍", count: 3, isActive: false },
          { emoji: "🎵", count: 2, isActive: true },
          { emoji: "👏", count: 1, isActive: false },
        ],
      },
      {
        id: "4",
        type: "other",
        senderName: "Bob",
        content: "最高だった！次はファンクやりたい",
        timestamp: now - 260000,
        reactions: [
          { emoji: "🎵", count: 4, isActive: true },
          { emoji: "😄", count: 2, isActive: false },
        ],
      },
      {
        id: "5",
        type: "own",
        content: "いいね！",
        timestamp: now - 250000,
      },
    ],
    onSend: fn(),
    onReactionClick: fn(),
    onAddReaction: fn(),
    recentEmojis: ["🔥", "✨", "🎉"],
    title: "チャット",
  },
};
