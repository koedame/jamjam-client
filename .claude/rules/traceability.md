---
paths:
  - "docs-spec/requirements.md"
  - "docs-spec/behavior/**"
  - "docs-spec/traceability.md"
  - "src/**"
  - "src-tauri/src/**"
  - "tests/**"
  - "ui/src/**"
---

# 要求トレーサビリティルール

反復V字モデル（W字）の運用ルール。決定の背景は [ADR-018](../../docs-spec/adr/ADR-018-iterative-v-model-traceability.md) を参照。

検証は `tests/traceability_test.rs` が `cargo test` の一部として自動実行する。以下のルールは「守るべき慣習」ではなく **CI が落ちる条件** である。

## 絶対禁止

1. **形骸化した検証の宣言**
   - `Verifies:` を書いたテストの本体にアサーションがない状態にしない
   - アサーションのないテストで `must` 要求を満たしたことにしない

2. **捏造した測定値**
   - 実行していない検証を成功として報告しない
   - E2E で測定できないものはハードコードせず `TestResult::not_implemented(scenario, reason)` を返す
   - `reason` には「何が足りないか」を書く（「未実装」だけでは不十分）

3. **数値の二重定義**
   - 遅延バジェット・プリセットパラメータをテストや GUI 側に書き写さない
   - 正は `src/audio/preset.rs`（ADR-019）。テストはそこから読む

## 指標は定数化させない

`Verifies:` 検証はテストの空洞を検出するが、**製品コード側で定数を返している値は検出できない**。定数は文法的に正しい値なので、grep も型検査も通る。実際に 2 件がこれで通過した。

| 値 | 状態 | 影響 |
|----|------|------|
| `ConnectionStats::packet_loss_rate` | `0.0` + TODO コメント | 上に載せた接続品質判定がロスを永久に検知できなかった |
| `LocalLatencyInfo::jitter_buffer_ms` | `0.0`、setter が未呼び出し | 遅延内訳が最大 42.67ms のバッファ分を欠落 |

### 禁止

1. **測定値であるべきフィールドに定数を入れない**
   - 「後で実装する」なら `Option` にして `None` を返す。`0.0` は「測定した結果ゼロ」を意味してしまう
   - `// TODO` を添えても検出されない。コメントは実行されない

2. **`tests/metric_liveness_test.rs` の対象構造体にフィールドを追加したまま放置しない**
   - `ConnectionStats` / `LocalLatencyInfo` / `LatencyBreakdown` / `BandwidthEstimator` が対象
   - 追加したフィールドが測定値なら、刺激を与えて反応することを検証する

### 判別の基準

測定値と定数を分けるのは「**それが測っている対象が変わったときに値が動くか**」である。動かないなら定数であり、測定値のふりをしてはならない。

```rust
// NG: 測定値のふりをした定数
packet_loss_rate: 0.0, // TODO: implement

// OK: 未測定であることを型で表す
packet_loss_rate: Option<f32>,  // None = 未測定

// OK: 実際に測る
packet_loss_rate: tracker.loss_rate(),
```

## 要求 ID の付与

| 対象 | 記法 | 例 |
|------|------|-----|
| 振る舞い要求 | `.feature` の Scenario 直上にタグ | `@REQ-LAT-115 @must` |
| 製品・設計要求 | `docs-spec/requirements.md` の表に行を追加 | `\| REQ-LAT-020 \| ... \| must \|` |

- 1 Scenario = 1 個の `@REQ-*` タグ + 1 個の `@must` / `@should` タグ
- ID 番号は `001`〜`099` が requirements.md 定義、`101`〜 が Scenario 定義
- 既存 ID の意味を変えない（要求が変わったら新しい ID を振る）

## 検証の宣言

テスト関数の doc comment（TypeScript は直上のコメント）に書く:

```rust
/// Verifies: REQ-LAT-115
#[test]
fn zero_latency_preset_stays_within_two_milliseconds() { ... }
```

```ts
// Verifies: REQ-I18N-103
it('falls back to English when a key is missing', () => { ... });
```

- 1 テストが複数要求を検証する場合は `Verifies:` 行を複数書く
- 複数テストが 1 要求を検証してもよい
- 検証対象がないテスト（リグレッション防止用など）に `Verifies:` は不要

## criticality の選び方

| 状況 | 選択 |
|------|------|
| 実装が存在し、アサーションで検証できる | `must` |
| 実装が存在しない（未実装機能） | `should` + 理由をコメントで併記 |
| 検証にハードウェア・実回線・マルチノードが必要 | `should` |
| 検証できる部分と未実装の部分が混在 | `should`（部分検証で `must` を満たしたことにしない）+ 検証可能な部分を `-0NN` の設計要求として切り出す |

`should` に落とすときは `.feature` にコメントで理由を残す。ギャップは `docs-spec/traceability.md` に自動で列挙される。

## 対応表の更新

`docs-spec/traceability.md` は生成物である。要求やテストを増減させたら再生成してコミットする:

```bash
JAMJAM_UPDATE_TRACEABILITY=1 cargo test --test traceability_test
```

再生成せずにコミットすると `traceability_matrix_is_up_to_date` が失敗する。差分は必ず目で確認する（`must` が未検証に転じていないか、意図せずギャップが増えていないか）。

## 作業項目 完了の条件

Plans.md の項目を完了扱いにする前に確認する:

- [ ] 追加した振る舞いに `@REQ-*` タグが付いている
- [ ] `must` 要求に対応するテストがある
- [ ] `docs-spec/traceability.md` を再生成してコミットした
- [ ] 追加した指標フィールドに liveness テストがある（定数化していない）
- [ ] `cargo test` / `npm run test:run`（ui/）が通る
