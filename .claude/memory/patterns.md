# patterns.md - 再利用パターン

> よく使うコードパターン、コマンド、ベストプラクティスを記録する。

---

## コマンド・手順の参照先

コマンド・手順の正は以下を参照する（ここには複製しない。複製すると更新漏れで乖離するため）:

| 用途 | 参照先 |
|------|--------|
| 品質チェック・ビルド | AGENTS.md「主要コマンド」 |
| コミット・プッシュ規約 | `.claude/rules/git-workflow.md`（実行は `/commit`） |
| 仕様と実装の同期チェック | `/sync-spec` スキル |

---

## コードパターン

### エラーハンドリング（Rust）

```rust
// Result を返す関数
pub fn example() -> Result<(), Error> {
    // エラー伝播には ? を使用
    some_operation()?;
    Ok(())
}

// thiserror でエラー型定義
#[derive(Debug, thiserror::Error)]
pub enum MyError {
    #[error("operation failed: {0}")]
    OperationFailed(String),
}
```

### 非同期処理（tokio）

```rust
#[tokio::main]
async fn main() {
    // 並列実行
    let (a, b) = tokio::join!(task_a(), task_b());
}
```

---

<!-- 新しいパターンはここに追加 -->
