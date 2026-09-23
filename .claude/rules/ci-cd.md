---
paths:
  - ".github/**"
  - "package.json"
  - "ui/package.json"
  - "ui/vite.config.ts"
  - "src-tauri/tauri.conf.json"
---

# CI/ローカル環境の整合性ルール

## 基本原則

**CIで動作するコマンドは、ローカル環境（macOS/Windows/Linux）でも同じ手順で動作しなければならない。**

## CI設定変更時の必須チェック

CI（`.github/workflows/*.yml`）を変更する際は、以下を確認する:

1. **ローカル再現性**: CIで実行するコマンドがローカルでも同じ結果になるか
2. **クロスプラットフォーム**: macOS, Windows, Linux全てで動作するか
3. **シェル構文**: Bash固有の構文（`if [ -d ... ]`等）はWindowsで動作しない

## Tauriプロジェクト固有のルール

| 項目 | ルール |
|-----|-------|
| 実行場所 | `cargo tauri dev/build`は**プロジェクトルート**から実行 |
| npm scripts | シェル固有構文を避け、`package.json`のnpm scriptsを使用 |
| beforeDevCommand | `npm run tauri:dev`（package.jsonで定義） |
| beforeBuildCommand | `npm run tauri:build`（package.jsonで定義） |

詳細は [ADR-009](../../docs-spec/adr/ADR-009-tauri-build-commands.md) を参照。

## 禁止事項

- CIの`working-directory`でのみ動作するコマンド設定
- Bash固有構文（`[ -d ]`, `[[ ]]`, `&&`のネスト等）をtauri.conf.jsonに直接記述
- CIで成功してもローカルでテストせずにマージ

## 問題発生時の対応フロー

1. CIとローカルで動作が異なる場合、**ローカル動作を優先**して修正
2. クロスプラットフォーム対応にはnpm scriptsまたはNode.jsスクリプトを使用
3. 解決策はADRに記録する

---

# GitHub機能の使用ルール

## 使用しない機能

以下のGitHub機能は本プロジェクトでは使用しない:

- **GitHub Packages** (ghcr.io含む)

## 禁止事項

- GitHub Packages へのpushを行うワークフローを作成しない
- `ghcr.io` へのログインやイメージプッシュを行うCI設定を追加しない
