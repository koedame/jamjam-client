---
paths:
  - "src/**"
  - "src-tauri/**"
  - "tests/**"
  - "ui/src/**"
  - "docs-spec/**"
  - "Cargo.toml"
  - "ui/package.json"
---

# 仕様書と実装の同期ルール

## 基本原則

**実装が仕様書に影響を与える変更を行った場合、同一コミットまたは直後のコミットで仕様書を更新する。**

自動チェックには `/sync-spec` スキルを使用する。

## 実装フェーズ指示

仕様書完成後、実装時は以下に従う:

- `docs-spec/` 以下を正として実装する（README や口頭説明より `docs-spec/` を正とする）
- ADR に記載された判断は変更しない
- 実装が仕様から逸脱する場合は必ず理由をコメントする
- リアルタイム制約を破る場合は理由をコメントで残す
- 不明点は `TODO` として明示する
- コメント等の言語は AGENTS.md の「言語規約」に従う

## 仕様書更新が必要なケース

| 変更内容 | 更新対象ドキュメント |
|---------|---------------------|
| 新規モジュール追加 | docs-spec/architecture.md（モジュール構成） |
| 公開API追加・変更 | docs-spec/api/*.md（該当するAPI仕様） |
| 新規ライブラリ導入 | docs-spec/architecture.md（主要ライブラリ） |
| エラー型追加 | docs-spec/api/*.md（エラーセクション） |
| 設計判断の変更 | docs-spec/adr/ADR-XXX-*.md（新規ADR作成） |
| 機能追加（作業項目の完了時） | docs-spec/README.md（実装状況） |

## 仕様書更新が不要なケース

- 内部実装の最適化（公開APIに影響なし）
- バグ修正（仕様通りの動作に修正）
- テストコードの追加・修正
- コメント・ドキュメントコメントの修正

## 更新手順

1. 実装変更をコミット
2. 影響を受ける仕様書を特定
3. 仕様書を更新（実装と一致させる）
4. 仕様書更新をコミット（実装コミットと同時でも可）

## コミットメッセージ例

```
Add noise gate effect

Implement NoiseGate with threshold, attack, and release parameters.
Update audio_engine.md to document the new effect.
```

または分割コミット:

```
# コミット1
Add noise gate effect implementation

# コミット2
Update audio_engine.md with NoiseGate API documentation
```

## 仕様書の整合性チェック

実装完了時に以下を確認する:

- [ ] 新規追加した公開構造体・トレイトがAPI仕様に記載されているか
- [ ] モジュール構成図が実際のディレクトリ構成と一致しているか
- [ ] エラー型が全て文書化されているか
- [ ] docs-spec/README.md の実装状況が最新か
