---
sidebar_position: 5
title: SettingsPanel
description: アプリケーション設定を管理するコンポーネント
---

# SettingsPanel - 設定パネル

アプリケーション設定を管理するコンポーネント。
一般設定、プロフィール、デバイス設定、診断機能を提供する。

---

## 概要

### 目的
- アプリ全体の設定を1箇所で管理
- デバイス選択と音声設定の調整
- 診断機能による環境チェックと最適化

### 使用場面
- 初回起動時（デバイス選択）
- セッション前の設定確認
- トラブルシューティング時

---

## ビジュアル仕様

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 設定                                                                      │
├───────┬───────────────────────────────────────────────────────────────────┤
│       │                                                                   │
│ 一般  │  テーマ                                                            │
│       │  ┌─────────────────────────────────────┐                          │
│ プロ  │  │  ダーク                      ▼     │                          │
│ フィ  │  └─────────────────────────────────────┘                          │
│ ール  │                                                                   │
│       │  言語                                                             │
│ デバ  │  ┌─────────────────────────────────────┐                          │
│ イス ←│  │  日本語                      ▼     │                          │
│       │  └─────────────────────────────────────┘                          │
│ 診断  │                                                                   │
│       │                                                                   │
│       │                                                                   │
│       │                                                                   │
│       │                                                                   │
│       │                                                                   │
│       │                                                                   │
│       │                                                                   │
│       │                                                                   │
└───────┴───────────────────────────────────────────────────────────────────┘
```

### デバイスタブ表示時

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 設定                                                                      │
├───────┬───────────────────────────────────────────────────────────────────┤
│       │                                                                   │
│ 一般  │  入力デバイス                                                      │
│       │  ┌─────────────────────────────────────┐                          │
│ プロ  │  │  MacBook Pro Microphone     ▼     │                          │
│ フィ  │  └─────────────────────────────────────┘                          │
│ ール  │                                                                   │
│       │  出力デバイス                                                      │
│ デバ ←│  ┌─────────────────────────────────────┐                          │
│ イス  │  │  MacBook Pro Speakers       ▼     │                          │
│       │  └─────────────────────────────────────┘                          │
│ 診断  │                                                                   │
│       │  入力チャンネル                                                    │
│       │  ◉ ステレオ (L+R)                                                 │
│       │  ○ モノラル (L)                                                   │
│       │  ○ モノラル (R)                                                   │
│       │                                                                   │
│       │  サンプリングレート                                                │
│       │  ┌─────────────────────────────────────┐                          │
│       │  │  48000 Hz                   ▼     │                          │
│       │  └─────────────────────────────────────┘                          │
│       │                                                                   │
│       │  バッファサイズ                                                    │
│       │  ┌─────────────────────────────────────┐                          │
│       │  │  512 samples (~10.7ms)      ▼     │                          │
│       │  └─────────────────────────────────────┘                          │
└───────┴───────────────────────────────────────────────────────────────────┘
```

---

## コンポーネント構成

### SettingsPanel（コンテナ）

全体を管理するルートコンポーネント。

```typescript
type SettingsTabId = "general" | "profile" | "devices" | "diagnostics";

interface SettingsPanelProps {
  /** 初期表示タブ */
  initialTab?: SettingsTabId;
  /** 一般設定 */
  generalSettings: GeneralSettings;
  /** プロフィール設定 */
  profileSettings: ProfileSettings;
  /** デバイス設定 */
  deviceSettings: DeviceSettings;
  /** 診断情報 */
  diagnosticsData: DiagnosticsData;
  /** 一般設定変更コールバック */
  onGeneralChange?: (settings: GeneralSettings) => void;
  /** プロフィール変更コールバック */
  onProfileChange?: (settings: ProfileSettings) => void;
  /** デバイス設定変更コールバック */
  onDeviceChange?: (settings: DeviceSettings) => void;
  /** 診断実行コールバック */
  onRunDiagnostics?: () => Promise<void>;
  /** プリセット適用コールバック */
  onApplyPreset?: (preset: DiagnosticPreset) => void;
}

interface GeneralSettings {
  theme: Theme;
  language: Language;
}

type Theme = "dark" | "light" | "system";
type Language = "ja" | "en";

interface ProfileSettings {
  displayName: string;
  displayNameError?: string;
}

interface DeviceSettings {
  inputDevices: DeviceInfo[];
  outputDevices: DeviceInfo[];
  selectedInputId: string | null;
  selectedOutputId: string | null;
  inputChannel: InputChannelMode;
  sampleRate: number;
  bufferSize: number;
  availableSampleRates: number[];
  availableBufferSizes: number[];
}

type InputChannelMode = "stereo" | "mono-left" | "mono-right";

interface DeviceInfo {
  id: string;
  name: string;
  channelCount: number;
}

interface DiagnosticsData {
  isRunning: boolean;
  lastRun: Date | null;
  results: DiagnosticResult[];
  availablePresets: DiagnosticPreset[];
}

interface DiagnosticResult {
  id: string;
  category: "latency" | "audio" | "network";
  status: "pass" | "warn" | "fail";
  message: string;
  details?: string;
}

interface DiagnosticPreset {
  id: string;
  name: string;
  description: string;
  settings: Partial<DeviceSettings>;
}
```

---

### VerticalTabs（垂直タブナビゲーション）

左サイドバーのタブ切り替えコンポーネント。

```typescript
interface VerticalTabsProps {
  /** タブ定義 */
  tabs: TabDefinition[];
  /** 選択中のタブID */
  selectedId: string;
  /** タブ選択コールバック */
  onSelect: (id: string) => void;
}

interface TabDefinition {
  id: string;
  label: string;
  icon?: string;
}
```

#### キーボードナビゲーション

| キー | 動作 |
|------|------|
| ↑/↓ | タブ選択移動 |
| Enter/Space | タブ決定 |
| Tab | タブグループから退出（次のフォーカス可能要素へ） |

---

### GeneralTab（一般設定タブ）

```typescript
interface GeneralTabProps {
  theme: Theme;
  language: Language;
  onThemeChange: (theme: Theme) => void;
  onLanguageChange: (language: Language) => void;
}
```

#### 構成要素

1. **FormField + Select (テーマ)**
   - オプション: "dark", "light", "system"
   - ラベル: i18n `settings.theme`

2. **FormField + Select (言語)**
   - オプション: "ja" (日本語), "en" (English)
   - ラベル: i18n `settings.language`

---

### ProfileTab（プロフィール設定タブ）

```typescript
interface ProfileTabProps {
  displayName: string;
  displayNameError?: string;
  onDisplayNameChange: (name: string) => void;
}
```

#### 構成要素

1. **FormField + Input (表示名)**
   - 最大文字数: 20
   - バリデーション: 空文字禁止、特殊文字制限
   - エラー表示: `displayNameError` がある場合に赤枠＋エラーメッセージ

---

### DevicesTab（デバイス設定タブ）

```typescript
interface DevicesTabProps {
  inputDevices: DeviceInfo[];
  outputDevices: DeviceInfo[];
  selectedInputId: string | null;
  selectedOutputId: string | null;
  inputChannel: InputChannelMode;
  sampleRate: number;
  bufferSize: number;
  availableSampleRates: number[];
  availableBufferSizes: number[];
  onInputDeviceChange: (deviceId: string) => void;
  onOutputDeviceChange: (deviceId: string) => void;
  onInputChannelChange: (mode: InputChannelMode) => void;
  onSampleRateChange: (rate: number) => void;
  onBufferSizeChange: (size: number) => void;
}
```

#### 構成要素

1. **FormField + Select (入力デバイス)**
   - オプション: `inputDevices`
   - 表示形式: `{name} ({channelCount}ch)`

2. **FormField + Select (出力デバイス)**
   - オプション: `outputDevices`
   - 表示形式: `{name} ({channelCount}ch)`

3. **FormField + RadioGroup (入力チャンネル)**
   - オプション:
     - `stereo`: "ステレオ (L+R)"
     - `mono-left`: "モノラル (L)"
     - `mono-right`: "モノラル (R)"

4. **FormField + Select (サンプリングレート)**
   - オプション: `availableSampleRates`
   - 表示形式: `{rate} Hz`
   - 一般的な値: 44100, 48000, 96000

5. **FormField + Select (バッファサイズ)**
   - オプション: `availableBufferSizes`
   - 表示形式: `{size} samples (~{latency}ms)`
   - レイテンシ計算: `(size / sampleRate) * 1000`
   - 一般的な値: 128, 256, 512, 1024

---

### DiagnosticsTab（診断タブ）

```typescript
interface DiagnosticsTabProps {
  isRunning: boolean;
  lastRun: Date | null;
  results: DiagnosticResult[];
  availablePresets: DiagnosticPreset[];
  onRunDiagnostics: () => Promise<void>;
  onApplyPreset: (preset: DiagnosticPreset) => void;
}
```

#### 構成要素

1. **診断実行ボタン**
   - ラベル: "診断を実行"
   - `isRunning` 時は無効化＋スピナー表示

2. **最終実行時刻**
   - 表示形式: "最終実行: YYYY-MM-DD HH:MM"
   - `lastRun` が null の場合: "まだ実行されていません"

3. **DiagnosticResultList**
   - 結果をカテゴリごとにグループ化
   - ステータスアイコン:
     - `pass`: ✓（緑）
     - `warn`: ⚠（黄）
     - `fail`: ✗（赤）
   - クリックで `details` を展開

4. **プリセット提案**
   - 診断結果に応じて推奨プリセットを表示
   - 各プリセット:
     - 名前、説明、「適用」ボタン
     - 適用内容のプレビュー

---

## サブコンポーネント

### FormField

```typescript
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
```

### Select

```typescript
interface SelectProps {
  value: string | number;
  options: SelectOption[];
  disabled?: boolean;
  onChange: (value: string | number) => void;
}

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

### Input

```typescript
interface InputProps {
  value: string;
  placeholder?: string;
  maxLength?: number;
  error?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}
```

### RadioGroup

```typescript
interface RadioGroupProps {
  name: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
}

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

---

## サイズ仕様

| 要素 | サイズ |
|------|--------|
| 左サイドバー幅 | 120px |
| 右コンテンツ領域 | 残り幅（可変） |
| 入力フィールド最大幅 | 400px |
| タブ項目高さ | 40px |
| タブ間スペース | 1px (border) |
| フィールド間スペース | 16px |

---

## アクセシビリティ

### ARIA属性

```tsx
// VerticalTabs
<div role="tablist" aria-orientation="vertical">
  <button
    role="tab"
    aria-selected={selected}
    aria-controls={`panel-${id}`}
    id={`tab-${id}`}
  >
    {label}
  </button>
</div>

<div
  role="tabpanel"
  aria-labelledby={`tab-${selectedId}`}
  id={`panel-${selectedId}`}
>
  {content}
</div>

// Select
<select
  aria-label={label}
  aria-describedby={error ? `${id}-error` : undefined}
  aria-invalid={!!error}
/>

// Input (表示名)
<input
  type="text"
  aria-label={t("settings.displayName")}
  aria-describedby={error ? `displayName-error` : undefined}
  aria-invalid={!!error}
  maxLength={20}
/>

// RadioGroup
<div role="radiogroup" aria-label={label}>
  <label>
    <input
      type="radio"
      role="radio"
      aria-checked={checked}
    />
    {label}
  </label>
</div>

// 診断結果
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {isRunning ? "診断実行中..." : "診断完了"}
</div>
```

### キーボード操作

| 要素 | キー | 動作 |
|------|------|------|
| VerticalTabs | ↑/↓ | タブ選択移動 |
| VerticalTabs | Enter/Space | タブ決定 |
| Select | ↑/↓ | オプション選択 |
| Select | Enter/Space | ドロップダウン開閉 |
| RadioGroup | ↑/↓ | オプション選択 |
| RadioGroup | Space | オプション決定 |
| Button | Enter/Space | 実行 |

---

## i18n キー

```json
{
  "settings.title": "設定",
  "settings.tabs.general": "一般",
  "settings.tabs.profile": "プロフィール",
  "settings.tabs.devices": "デバイス",
  "settings.tabs.diagnostics": "診断",

  "settings.theme": "テーマ",
  "settings.theme.dark": "ダーク",
  "settings.theme.light": "ライト",
  "settings.theme.system": "システム設定に従う",

  "settings.language": "言語",
  "settings.language.ja": "日本語",
  "settings.language.en": "English",

  "settings.displayName": "表示名",
  "settings.displayName.error.required": "表示名は必須です",
  "settings.displayName.error.invalid": "表示名に使用できない文字が含まれています",
  "settings.displayName.error.tooLong": "表示名は20文字以内で入力してください",

  "settings.inputDevice": "入力デバイス",
  "settings.outputDevice": "出力デバイス",
  "settings.inputChannel": "入力チャンネル",
  "settings.inputChannel.stereo": "ステレオ (L+R)",
  "settings.inputChannel.monoLeft": "モノラル (L)",
  "settings.inputChannel.monoRight": "モノラル (R)",
  "settings.sampleRate": "サンプリングレート",
  "settings.bufferSize": "バッファサイズ",
  "settings.bufferSize.format": "{{size}} samples (~{{latency}}ms)",

  "settings.diagnostics.run": "診断を実行",
  "settings.diagnostics.running": "診断実行中...",
  "settings.diagnostics.lastRun": "最終実行: {{date}}",
  "settings.diagnostics.noRun": "まだ実行されていません",
  "settings.diagnostics.category.latency": "レイテンシ",
  "settings.diagnostics.category.audio": "音声",
  "settings.diagnostics.category.network": "ネットワーク",
  "settings.diagnostics.status.pass": "正常",
  "settings.diagnostics.status.warn": "警告",
  "settings.diagnostics.status.fail": "エラー",
  "settings.diagnostics.preset.apply": "適用",
  "settings.diagnostics.preset.recommended": "推奨設定"
}
```

---

## 使用例

```tsx
<SettingsPanel
  initialTab="devices"
  generalSettings={{
    theme: "dark",
    language: "ja",
  }}
  profileSettings={{
    displayName: "山田太郎",
    displayNameError: undefined,
  }}
  deviceSettings={{
    inputDevices: [
      { id: "device-1", name: "MacBook Pro Microphone", channelCount: 1 },
      { id: "device-2", name: "USB Audio Interface", channelCount: 2 },
    ],
    outputDevices: [
      { id: "device-3", name: "MacBook Pro Speakers", channelCount: 2 },
      { id: "device-4", name: "USB Audio Interface", channelCount: 2 },
    ],
    selectedInputId: "device-1",
    selectedOutputId: "device-3",
    inputChannel: "stereo",
    sampleRate: 48000,
    bufferSize: 512,
    availableSampleRates: [44100, 48000, 96000],
    availableBufferSizes: [128, 256, 512, 1024],
  }}
  diagnosticsData={{
    isRunning: false,
    lastRun: new Date("2026-01-27T10:00:00"),
    results: [
      {
        id: "latency-1",
        category: "latency",
        status: "pass",
        message: "レイテンシは許容範囲内です",
        details: "Round-trip time: 12ms",
      },
      {
        id: "audio-1",
        category: "audio",
        status: "warn",
        message: "バッファサイズが大きい可能性があります",
        details: "現在のバッファサイズ: 1024 samples (~21.3ms)",
      },
    ],
    availablePresets: [
      {
        id: "preset-low-latency",
        name: "低レイテンシ",
        description: "レイテンシを最小化（CPU負荷高）",
        settings: {
          sampleRate: 48000,
          bufferSize: 128,
        },
      },
    ],
  }}
  onGeneralChange={handleGeneralChange}
  onProfileChange={handleProfileChange}
  onDeviceChange={handleDeviceChange}
  onRunDiagnostics={handleRunDiagnostics}
  onApplyPreset={handleApplyPreset}
/>
```

---

## 関連ドキュメント

- [コンポーネントカタログ](./) - 全コンポーネント一覧
