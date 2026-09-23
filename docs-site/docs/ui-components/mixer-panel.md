---
sidebar_position: 3
title: MixerPanel
description: DAWスタイルのミキシングコンソールコンポーネント
---

# MixerPanel - ミキシングコンソール

DAWスタイルのミキシングコンソールコンポーネント。
セッション中の音量・パン調整、レベル監視を行う。

---

## 概要

### 目的
- 自分と参加者の音声をリアルタイムで監視・調整
- DAWライクな操作感で音楽制作に慣れたユーザーに親しみやすいUI

### 使用場面
- セッション画面のメインUI
- 音量バランス調整時

---

## ビジュアル仕様

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ミキサー                                                                    │
├────────┬────────┬────────┬────────┐                    ┌──────────────────┤
│ 音質   │48kHz   │48kHz   │44.1kHz │                    │     -23db -23db  │
│        │ /2ch   │ /1ch   │ /2ch   │                    │                  │
├────────┼────────┼────────┼────────┤                    │   ┌───┐ ┌───┐   │
│ PAN    │ ├──┼──┤│ ├──┼──┤│ ├──┼──┤│                    │   │   │ │   │   │
├────────┼────────┼────────┼────────┤                    │   │   │ │   │   │
│        │-0.0    │-0.0    │-0.0    │                    │   │   │ │   │   │
│        │-23db   │-23db   │-23db   │                    │   │   │ │   │   │
├────────┼────────┼────────┼────────┤                    │   │   │ │   │   │
│        │ ██ ██  │ ██ ██  │ ██ ██  │                    │   │   │ │   │   │
│ 音量   │ ██ ██  │ ██ ██  │ ██ ██  │                    │   └───┘ └───┘   │
│        │ ░░ ░░  │ ░░ ░░  │ ░░ ░░  │                    │      L     R     │
│        │ ░░ ░░  │ ░░ ░░  │ ░░ ░░  │                    │                  │
│        │ [─] [─]│ [─] [─]│ [─] [─]│                    │    マスター      │
├────────┼────────┼────────┼────────┤                    │                  │
│ 名前   │  自分  │  XXXX  │  XXXX  │                    │  ┌────────────┐  │
├────────┼────────┼────────┼────────┤                    │  │   退室     │  │
│ミュート│   🎤   │   🔇   │   🔇   │                    │  └────────────┘  │
└────────┴────────┴────────┴────────┘                    └──────────────────┘
```

---

## コンポーネント構成

### MixerPanel（コンテナ）

全体を管理するルートコンポーネント。

```typescript
interface MixerPanelProps {
  /** 自分のチャンネル情報 */
  localChannel: LocalChannelData;
  /** リモート参加者のチャンネル情報 */
  remoteChannels: RemoteChannelData[];
  /** マスター出力情報 */
  masterOutput: MasterOutputData;
  /** 退室コールバック */
  onLeaveSession?: () => void;
  /** ミュート切替コールバック */
  onMuteToggle?: (channelId: string) => void;
  /** 音量変更コールバック */
  onVolumeChange?: (channelId: string, volume: number) => void;
  /** パン変更コールバック */
  onPanChange?: (channelId: string, pan: number) => void;
}

interface LocalChannelData {
  id: string;
  name: string;
  sampleRate: number;      // e.g., 48000
  channels: number;        // 1 (mono) or 2 (stereo)
  levelL: number;          // 0-100 (left channel level)
  levelR: number;          // 0-100 (right channel level)
  volume: number;          // 0-100
  pan: number;             // -100 to 100 (L to R)
  isMuted: boolean;
}

interface RemoteChannelData {
  id: string;
  name: string;
  sampleRate: number;
  channels: number;
  levelL: number;
  levelR: number;
  volume: number;
  pan: number;
  isMuted: boolean;
}

interface MasterOutputData {
  levelL: number;          // 0-100
  levelR: number;          // 0-100
  peakL: number;           // dB value for display
  peakR: number;           // dB value for display
}
```

---

### ChannelStrip（チャンネルストリップ）

個別のチャンネルを表示・操作するコンポーネント。

```typescript
interface ChannelStripProps {
  /** チャンネルID */
  id: string;
  /** 表示名 */
  name: string;
  /** チャンネルタイプ */
  type: "local" | "remote";
  /** サンプリングレート (Hz) */
  sampleRate: number;
  /** チャンネル数 (1 or 2) */
  channelCount: number;
  /** 左チャンネルレベル (0-100) */
  levelL: number;
  /** 右チャンネルレベル (0-100) */
  levelR: number;
  /** 音量 (0-100) */
  volume: number;
  /** パン (-100 to 100) */
  pan: number;
  /** ミュート状態 */
  isMuted: boolean;
  /** 音量変更コールバック */
  onVolumeChange?: (volume: number) => void;
  /** パン変更コールバック */
  onPanChange?: (pan: number) => void;
  /** ミュート切替コールバック */
  onMuteToggle?: () => void;
}
```

#### 構成要素（上から下）

1. **AudioQualityBadge** - 音質表示
   - 形式: `{sampleRate/1000}kHz/{channels}ch`
   - 例: "48kHz/2ch", "44.1kHz/1ch"

2. **PanSlider** - パンスライダー
   - 水平方向のスライダー
   - 範囲: -100（左）〜 0（中央）〜 100（右）
   - ダブルクリックで中央にリセット

3. **LevelDisplay** - レベル表示
   - 形式: `{peakL}db {peakR}db`
   - 例: "-0.0 -23db"

4. **StereoMeter** - ステレオレベルメーター
   - L/R 2本のメーター
   - 色分け:
     - -∞ to -12dB: 緑 (`--color-meter-low`)
     - -12 to -3dB: 黄 (`--color-meter-mid`)
     - -3 to 0dB: 赤 (`--color-meter-high`)

5. **StereoFader** - ステレオ音量フェーダー
   - L/R 2本のフェーダー（連動）
   - 範囲: 0-100
   - ダブルクリックで80（0dB）にリセット

6. **ChannelLabel** - 名前ラベル
   - ローカル: "自分" (i18n: `mixer.self`)
   - リモート: ユーザー名

7. **MuteButton** - ミュートボタン
   - ローカル: マイクアイコン（🎤 / 🎤🚫）
   - リモート: スピーカーアイコン（🔊 / 🔇）

---

### MasterSection（マスターセクション）

```typescript
interface MasterSectionProps {
  /** 左チャンネルレベル (0-100) */
  levelL: number;
  /** 右チャンネルレベル (0-100) */
  levelR: number;
  /** 左チャンネルピーク (dB) */
  peakL: number;
  /** 右チャンネルピーク (dB) */
  peakR: number;
  /** 退室コールバック */
  onLeave?: () => void;
}
```

#### 構成要素
1. **LevelDisplay** - ピークレベル表示
2. **StereoMeter** - L/R レベルメーター
3. **Label** - 「マスター」(i18n: `mixer.master`)
4. **LeaveButton** - 退室ボタン (i18n: `mixer.leave`)

---

## サブコンポーネント

### StereoMeter

```typescript
interface StereoMeterProps {
  /** 左チャンネルレベル (0-100) */
  levelL: number;
  /** 右チャンネルレベル (0-100) */
  levelR: number;
  /** 高さ (px) */
  height?: number;
  /** ミュート状態（メーターをグレーアウト） */
  isMuted?: boolean;
}
```

### StereoFader

```typescript
interface StereoFaderProps {
  /** 音量 (0-100) */
  volume: number;
  /** 高さ (px) */
  height?: number;
  /** 無効状態 */
  disabled?: boolean;
  /** 変更コールバック */
  onChange?: (volume: number) => void;
}
```

### PanSlider

```typescript
interface PanSliderProps {
  /** パン値 (-100 to 100) */
  value: number;
  /** 無効状態 */
  disabled?: boolean;
  /** 変更コールバック */
  onChange?: (value: number) => void;
}
```

### AudioQualityBadge

```typescript
interface AudioQualityBadgeProps {
  /** サンプリングレート (Hz) */
  sampleRate: number;
  /** チャンネル数 */
  channels: number;
}
```

---

## サイズ仕様

| 要素 | サイズ |
|------|--------|
| チャンネルストリップ幅 | 100px |
| マスターセクション幅 | 140px |
| メーター高さ | 200px |
| フェーダー高さ | 200px |
| パンスライダー幅 | 80px |
| チャンネル間スペース | 8px |

---

## アクセシビリティ

### ARIA属性

```tsx
// StereoFader
<input
  type="range"
  role="slider"
  aria-label={t("mixer.volume", "Volume")}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuenow={volume}
  aria-valuetext={`${volume}%`}
/>

// PanSlider
<input
  type="range"
  role="slider"
  aria-label={t("mixer.pan", "Pan")}
  aria-valuemin={-100}
  aria-valuemax={100}
  aria-valuenow={pan}
  aria-valuetext={panToText(pan)} // "Left 50%", "Center", "Right 30%"
/>

// MuteButton
<button
  aria-label={t(isMuted ? "mixer.unmute" : "mixer.mute")}
  aria-pressed={isMuted}
/>

// LeaveButton
<button
  aria-label={t("mixer.leave", "Leave session")}
/>
```

### キーボード操作

| 要素 | キー | 動作 |
|------|------|------|
| フェーダー | ↑/↓ | 1ずつ増減 |
| フェーダー | Page Up/Down | 10ずつ増減 |
| パンスライダー | ←/→ | 5ずつ増減 |
| パンスライダー | Home/End | 最小/最大 |
| ミュートボタン | Space/Enter | トグル |
| 退室ボタン | Space/Enter | 確認ダイアログ表示 |

---

## i18n キー

```json
{
  "mixer.self": "自分",
  "mixer.master": "マスター",
  "mixer.volume": "音量",
  "mixer.pan": "パン",
  "mixer.mute": "ミュート",
  "mixer.unmute": "ミュート解除",
  "mixer.leave": "退室",
  "mixer.leaveConfirm": "セッションから退室しますか？",
  "mixer.audioQuality": "{{rate}}kHz/{{ch}}ch"
}
```

---

## 使用例

```tsx
<MixerPanel
  localChannel={{
    id: "local",
    name: "自分",
    sampleRate: 48000,
    channels: 2,
    levelL: 65,
    levelR: 70,
    volume: 80,
    pan: 0,
    isMuted: false,
  }}
  remoteChannels={[
    {
      id: "peer-1",
      name: "山田太郎",
      sampleRate: 48000,
      channels: 1,
      levelL: 45,
      levelR: 45,
      volume: 75,
      pan: -20,
      isMuted: false,
    },
  ]}
  masterOutput={{
    levelL: 55,
    levelR: 60,
    peakL: -12,
    peakR: -10,
  }}
  onLeaveSession={handleLeave}
  onMuteToggle={handleMuteToggle}
  onVolumeChange={handleVolumeChange}
  onPanChange={handlePanChange}
/>
```

---

---

## サブコンポーネント詳細

### StereoMeter（ステレオレベルメーター）

Canvas ベースのリアルタイムレベル表示。

```typescript
interface StereoMeterProps {
  /** 左チャンネルレベル (0-100) */
  levelL: number;
  /** 右チャンネルレベル (0-100) */
  levelR: number;
  /** 高さ (px) - default: 200 */
  height?: number;
  /** ミュート状態 */
  isMuted?: boolean;
  /** ピークリリース時間 (ms) - default: 1500 */
  peakReleaseTime?: number;
}
```

#### 描画仕様

- L/R 2本のバー + dBスケール
- レベル 0-100 を擬似対数スケールで表示
- ピークホールド: 500ms 保持 → releaseTime で減衰

#### 色分け（dB → 表示色）

| dBレベル | 色 | 位置 (%) |
|---------|-----|---------|
| 0 dB | 赤 (`--color-meter-high`) | 100% |
| -6 dB | 黄 | 85% |
| -12 dB | 黄 (`--color-meter-mid`) | 70% |
| -18 dB | 緑 | 55% |
| -24 dB | 緑 | 40% |
| -30 dB | 緑 (`--color-meter-low`) | 27% |
| -40 dB | 緑 | 14% |
| -50 dB | 緑 | 3% |

#### dB 変換式

```typescript
function levelToDb(level: number): string {
  if (level <= 0) return "-∞";
  const db = (level / 100) * 60 - 60; // 0-100 → -60dB〜0dB
  if (db >= 0) return "0.0";
  return db.toFixed(1);
}
```

---

### StereoFader（ステレオ音量フェーダー）

縦型のボリュームコントロール。

```typescript
interface StereoFaderProps {
  /** 音量 (0-100) */
  volume: number;
  /** 高さ (px) - default: 200 */
  height?: number;
  /** 無効状態 */
  disabled?: boolean;
  /** 変更コールバック */
  onChange?: (volume: number) => void;
  /** アクセシビリティラベル - default: "Volume" */
  label?: string;
}
```

#### スケール目盛り

| 位置 (%) | 意味 |
|---------|------|
| 80% | 0dB (ユニティゲイン) - 強調表示 |
| 60% | - |
| 40% | - |
| 20% | - |

#### 操作

| 操作 | 動作 |
|------|------|
| ドラッグ | 音量変更 |
| ↑/↓ | 1ずつ増減 |
| Page Up/Down | 10ずつ増減 |
| Home | 最大 (100) |
| End | 最小 (0) |
| ダブルクリック | 0dB (80) にリセット |

---

### PanSlider（パンスライダー）

水平方向のパンコントロール。

```typescript
interface PanSliderProps {
  /** パン値 (-100: 左, 0: 中央, 100: 右) */
  value: number;
  /** 無効状態 */
  disabled?: boolean;
  /** 変更コールバック */
  onChange?: (value: number) => void;
  /** アクセシビリティラベル - default: "Pan" */
  label?: string;
}
```

#### 操作

| 操作 | 動作 |
|------|------|
| ドラッグ | パン変更 |
| ←/→ | 値を変更 |
| ダブルクリック | 中央 (0) にリセット |

#### ARIA属性

```tsx
<input
  type="range"
  aria-label={label}
  aria-valuemin={-100}
  aria-valuemax={100}
  aria-valuenow={value}
/>
```

---

### AudioQualityBadge（音質バッジ）

サンプリングレートとチャンネル数を表示。

```typescript
interface AudioQualityBadgeProps {
  /** サンプリングレート (Hz) */
  sampleRate: number;
  /** チャンネル数 (1 or 2) */
  channels: number;
}
```

#### 表示形式

```
{sampleRate/1000}kHz/{channels}ch
```

例: `48kHz/2ch`, `44.1kHz/1ch`

---

### usePeakHold（フック）

ピークレベルのホールド・減衰を管理するカスタムフック。

```typescript
interface PeakHoldOptions {
  /** ホールド時間 (ms) - default: 500 */
  holdTime?: number;
  /** 減衰時間 (ms) - default: 1500 */
  releaseTime?: number;
}

interface PeakHoldState {
  peakL: number;
  peakR: number;
}

function usePeakHold(
  levelL: number,
  levelR: number,
  options?: PeakHoldOptions
): PeakHoldState;
```

#### 動作

1. 新しいピーク検出 → 即座に更新
2. `holdTime` (500ms) 経過後 → 減衰開始
3. `releaseTime` (1500ms) かけて 0 まで減衰
4. 減衰中に新しいピーク検出 → 即座にピーク更新

#### 使用例

```tsx
const { peakL, peakR } = usePeakHold(levelL, levelR, {
  holdTime: 600,
  releaseTime: 200,
});
```

---

## 関連ドキュメント

- [コンポーネントカタログ](./) - 全コンポーネント一覧
