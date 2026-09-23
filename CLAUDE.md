# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

プロジェクトガイド（概要・最優先要件・開発フロー・ルール一覧・対話ルール・言語規約）は AGENTS.md を参照（以下でインポートされる）:

@AGENTS.md

---

## Claude Code 固有の構成

設定分割の経緯は [ADR-014](./docs-spec/adr/ADR-014-claude-code-config-structure.md) を参照。

| 場所 | 内容 | 読み込みタイミング |
|------|------|-------------------|
| `CLAUDE.md` + `AGENTS.md` | プロジェクトガイド・対話ルール | 常時 |
| `.claude/rules/*.md` | トピック別ルール（一覧は AGENTS.md「ルール一覧」） | `paths:` に一致するファイル操作時（`paths:` なしは常時） |
| `.claude/skills/*/SKILL.md` | ワークフロー手順 | `/スキル名` 呼び出し時、または自動判断 |
| `.claude/memory/*.md` | セッション間メモ | 必要時に明示的に参照 |
| `.claude/settings.json` | 権限設定 | 起動時 |

## メンテナンス規約

- CLAUDE.md と AGENTS.md は簡潔に保つ（公式推奨: CLAUDE.md は200行以下）
- トピック別の詳細ルールは本ファイルに追記せず `.claude/rules/` に追加する（`paths:` でスコープ指定）
- `settings.json` の `Read` deny は補助的防御にとどまる。運用上の秘匿情報はこのリポジトリに置かない（詳細: `.claude/rules/source-available.md`）
