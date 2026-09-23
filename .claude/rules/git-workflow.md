# Git ワークフロールール

## コミットメッセージ

### 言語

- コミットメッセージは英語で記述する

### 形式

- シンプル形式（feat:, fix: などのプレフィックスは使用しない）
- 1行目: 変更内容の要約（50文字以内を目安）
- 2行目: 空行
- 3行目以降: 必要に応じて詳細説明

### 書き方ルール

- 「何を」「なぜ」変更したかを明確に書く
- 1行目は命令形で書く（例: "Add", "Fix", "Change"）
- 曖昧な表現を避ける

❌ 悪い例

```
Fix
Bug fix
Various changes
```

⭕ 良い例

```
Change audio capture buffer size to 20ms

Adjusted frame size to keep latency under 150ms.
```

## コミット単位

- 1つの論理的な変更につき1コミット
- 複数の無関係な変更を1コミットに混ぜない
- ビルドが通る状態でコミットする

## 禁止事項

- 機密情報（APIキー、トークン等）をコミットしない
- 生成ファイル（build/, dist/ 等）をコミットしない（.gitignore で除外）

## Git Push

- `git push` 単体ではなく、リモートとブランチを明示する（例: `git push origin main`、作業ブランチでは `git push origin <ブランチ名>`）
