/**
 * WindowsOverview - Connected session composition demonstration
 * Shows how the mixer and docked chat compose the connected session window.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ConnectionPanel } from "../components/ConnectionPanel";
import { MixerPanel } from "../components/MixerPanel";
import { ChatPanel } from "../components/ChatPanel";
import { SettingsPanel } from "../components/SettingsPanel";
import type { ChatMessageData } from "../components/ChatPanel/ChatMessageList";
import { JOIN_WINDOW_SIZE, MIXER_WINDOW_SIZE } from "../lib/windowSizes";

const meta = {
  title: "Windows/Overview",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockChannels = [
  {
    id: "local-1",
    name: "You",
    type: "local" as const,
    sampleRate: 48000,
    channelCount: 2,
    levelL: 65,
    levelR: 60,
    volume: 80,
    pan: 0,
    isMuted: false,
  },
  {
    id: "remote-1",
    name: "Alice",
    type: "remote" as const,
    sampleRate: 48000,
    channelCount: 2,
    levelL: 55,
    levelR: 50,
    volume: 75,
    pan: -30,
    isMuted: false,
  },
];

const now = Date.now();
const mockMessages: ChatMessageData[] = [
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
    content: "こんにちは！準備できた？",
    timestamp: now - 280000,
  },
  {
    id: "3",
    type: "own",
    content: "OK、始めよう！",
    timestamp: now - 270000,
  },
];

const mockDevices = {
  input: [
    { id: "mic-1", name: "Built-in Microphone", isDefault: true },
    { id: "mic-2", name: "USB Audio Device" },
  ],
  output: [
    { id: "out-1", name: "Built-in Speakers", isDefault: true },
    { id: "out-2", name: "USB Audio Device" },
  ],
};

/**
 * Connected session window — mixer (center) + docked chat (right column).
 *
 * The room / participants sidebar is part of the app shell (MainScreen) and
 * is not shown here; this story focuses on the two reusable panels that
 * compose the connected window's center and right columns.
 */
function ConnectedWindow() {
  return (
    <div
      style={{
        display: "flex",
        width: "894px",
        height: "618px",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-primary)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
        <MixerPanel channels={mockChannels} />
      </div>
      <div
        style={{
          width: "280px",
          flexShrink: 0,
          display: "flex",
        }}
      >
        <ChatPanel messages={mockMessages} onSend={() => {}} />
      </div>
    </div>
  );
}

/**
 * Disconnected state - Only Connection Window is shown
 */
export const DisconnectedState: Story = {
  render: () => (
    <div style={{ padding: "40px", background: "#f5f5f5", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "24px", fontFamily: "system-ui" }}>
        Disconnected State - 未接続時
      </h2>
      <p style={{ marginBottom: "24px", color: "#666", fontFamily: "system-ui" }}>
        アプリ起動時または退室後、接続画面ウィンドウのみが表示されます。
      </p>
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ marginBottom: "8px", fontFamily: "system-ui", fontSize: "14px", color: "#999" }}>
            接続画面 ({JOIN_WINDOW_SIZE.width}×{JOIN_WINDOW_SIZE.height})
          </h3>
          <div style={{ width: `${JOIN_WINDOW_SIZE.width}px`, height: `${JOIN_WINDOW_SIZE.height}px`, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <ConnectionPanel
              state="idle"
              onCreateRoom={() => {}}
              onJoinRoom={() => {}}
              onOpenSettings={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Connecting state - Connection window shows loading
 */
export const ConnectingState: Story = {
  render: () => (
    <div style={{ padding: "40px", background: "#f5f5f5", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "24px", fontFamily: "system-ui" }}>
        Connecting State - 接続中
      </h2>
      <p style={{ marginBottom: "24px", color: "#666", fontFamily: "system-ui" }}>
        セッションへの接続処理中、接続画面にスピナーが表示されます。
      </p>
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ marginBottom: "8px", fontFamily: "system-ui", fontSize: "14px", color: "#999" }}>
            接続画面 ({JOIN_WINDOW_SIZE.width}×{JOIN_WINDOW_SIZE.height}) - 接続中
          </h3>
          <div style={{ width: `${JOIN_WINDOW_SIZE.width}px`, height: `${JOIN_WINDOW_SIZE.height}px`, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <ConnectionPanel state="connecting" onCancel={() => {}} />
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Connected state - The unified session window (mixer + docked chat).
 *
 * After connecting, the app shows a single 1134×700 window: room sidebar,
 * mixer, and a docked chat column. This story shows the mixer + chat pair.
 */
export const ConnectedState: Story = {
  render: () => (
    <div style={{ padding: "40px", background: "#f5f5f5", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "24px", fontFamily: "system-ui" }}>
        Connected State - 接続済み
      </h2>
      <p style={{ marginBottom: "24px", color: "#666", fontFamily: "system-ui" }}>
        接続成功後、単一のウィンドウにミキサーとドッキングされたチャット列が表示されます。
        （ルーム／参加者サイドバーはアプリシェル側で描画されます。）
      </p>
      <div style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)", width: "fit-content" }}>
        <ConnectedWindow />
      </div>
    </div>
  ),
};

/**
 * Settings Window - Can be opened at any time
 */
export const SettingsWindow: Story = {
  render: () => (
    <div style={{ padding: "40px", background: "#f5f5f5", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "24px", fontFamily: "system-ui" }}>
        Settings Window - 設定画面
      </h2>
      <p style={{ marginBottom: "24px", color: "#666", fontFamily: "system-ui" }}>
        設定画面はどの状態からでも開くことができます。
        非モーダルで、他のウィンドウとの同時操作が可能です。
      </p>
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ marginBottom: "8px", fontFamily: "system-ui", fontSize: "14px", color: "#999" }}>
            設定 (600×500)
          </h3>
          <div style={{ width: "600px", height: "500px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <SettingsPanel
              language="ja"
              displayName="User"
              inputDevices={mockDevices.input}
              outputDevices={mockDevices.output}
              selectedInputId="mic-1"
              selectedOutputId="out-1"
              initialTab="devices"
              onLanguageChange={() => {}}
              onDisplayNameChange={() => {}}
              onInputDeviceChange={() => {}}
              onOutputDeviceChange={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * All Windows Overview - Interactive demonstration
 */
export const AllWindowsInteractive: Story = {
  render: function AllWindowsDemo() {
    const [appState, setAppState] = useState<"disconnected" | "connecting" | "connected">("disconnected");
    const [code, setCode] = useState("");
    const [showSettings, setShowSettings] = useState(false);

    const handleCreateRoom = () => {
      setAppState("connecting");
      setTimeout(() => setAppState("connected"), 1500);
    };

    const handleJoinRoom = () => {
      setAppState("connecting");
      setTimeout(() => setAppState("connected"), 1500);
    };

    const handleCancel = () => {
      setAppState("disconnected");
    };

    const handleLeave = () => {
      setAppState("disconnected");
    };

    return (
      <div style={{ padding: "40px", background: "#f5f5f5", minHeight: "100vh" }}>
        <h2 style={{ marginBottom: "16px", fontFamily: "system-ui" }}>
          Multi-Window Architecture Demo
        </h2>
        <div style={{ marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontFamily: "system-ui", fontSize: "14px" }}>
            現在の状態: <strong>{appState === "disconnected" ? "未接続" : appState === "connecting" ? "接続中" : "接続済み"}</strong>
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: "8px 16px",
              background: showSettings ? "#333" : "#fff",
              color: showSettings ? "#fff" : "#333",
              border: "1px solid #333",
              cursor: "pointer",
              fontFamily: "system-ui",
            }}
          >
            {showSettings ? "設定を閉じる" : "設定を開く"}
          </button>
          {appState === "connected" && (
            <button
              onClick={handleLeave}
              style={{
                padding: "8px 16px",
                background: "#fff",
                color: "#c00",
                border: "1px solid #c00",
                cursor: "pointer",
                fontFamily: "system-ui",
              }}
            >
              退室
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Connection Window - shown only when disconnected/connecting */}
          {(appState === "disconnected" || appState === "connecting") && (
            <div>
              <h3 style={{ marginBottom: "8px", fontFamily: "system-ui", fontSize: "14px", color: "#999" }}>
                接続画面
              </h3>
              <div style={{ width: `${JOIN_WINDOW_SIZE.width}px`, height: `${JOIN_WINDOW_SIZE.height}px`, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <ConnectionPanel
                  state={appState === "connecting" ? "connecting" : "idle"}
                  code={code}
                  onCodeChange={setCode}
                  onCreateRoom={handleCreateRoom}
                  onJoinRoom={handleJoinRoom}
                  onCancel={handleCancel}
                  onOpenSettings={() => setShowSettings(true)}
                />
              </div>
            </div>
          )}

          {/* Connected session window - shown only when connected */}
          {appState === "connected" && (
            <div>
              <h3 style={{ marginBottom: "8px", fontFamily: "system-ui", fontSize: "14px", color: "#999" }}>
                接続済みセッション (ミキサー + チャット)
              </h3>
              <div style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)", width: "fit-content" }}>
                <ConnectedWindow />
              </div>
            </div>
          )}

          {/* Settings Window - can be shown at any time */}
          {showSettings && (
            <div>
              <h3 style={{ marginBottom: "8px", fontFamily: "system-ui", fontSize: "14px", color: "#999" }}>
                設定
              </h3>
              <div style={{ width: "600px", height: "500px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <SettingsPanel
                  language="ja"
                  displayName="User"
                  inputDevices={mockDevices.input}
                  outputDevices={mockDevices.output}
                  selectedInputId="mic-1"
                  selectedOutputId="out-1"
                  initialTab="general"
                  onLanguageChange={() => {}}
                  onDisplayNameChange={() => {}}
                  onInputDeviceChange={() => {}}
                  onOutputDeviceChange={() => {}}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
};

/**
 * Window Specifications Reference
 */
export const WindowSpecifications: Story = {
  render: () => (
    <div style={{ padding: "40px", background: "#f5f5f5", minHeight: "100vh", fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: "24px" }}>Window Specifications</h2>

      <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "800px", background: "#fff" }}>
        <thead>
          <tr style={{ background: "#333", color: "#fff" }}>
            <th style={{ padding: "12px", textAlign: "left", border: "1px solid #333" }}>Window</th>
            <th style={{ padding: "12px", textAlign: "left", border: "1px solid #333" }}>Default Size</th>
            <th style={{ padding: "12px", textAlign: "left", border: "1px solid #333" }}>State</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}><strong>接続画面</strong></td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{JOIN_WINDOW_SIZE.width} × {JOIN_WINDOW_SIZE.height}</td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>未接続 / 接続中</td>
          </tr>
          <tr style={{ background: "#f9f9f9" }}>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}><strong>接続済みセッション</strong></td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{MIXER_WINDOW_SIZE.width} × {MIXER_WINDOW_SIZE.height}</td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>接続済み（ミキサー + ドッキングされたチャット）</td>
          </tr>
          <tr>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}><strong>設定</strong></td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>600 × 500</td>
            <td style={{ padding: "12px", border: "1px solid #ddd" }}>任意</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ marginTop: "32px", marginBottom: "16px" }}>State Transitions</h3>
      <div style={{ background: "#fff", padding: "24px", border: "1px solid #ddd", maxWidth: "600px" }}>
        <p style={{ margin: "0 0 16px 0" }}>
          <strong>未接続時:</strong> 接続画面のみ表示 ({JOIN_WINDOW_SIZE.width}×{JOIN_WINDOW_SIZE.height})。設定はオプション。
        </p>
        <p style={{ margin: "0 0 16px 0" }}>
          <strong>接続中:</strong> 接続画面にローディング表示。
        </p>
        <p style={{ margin: "0" }}>
          <strong>接続済み:</strong> 単一ウィンドウ ({MIXER_WINDOW_SIZE.width}×{MIXER_WINDOW_SIZE.height}) にサイドバー・ミキサー・チャットを表示。
        </p>
      </div>
    </div>
  ),
};
