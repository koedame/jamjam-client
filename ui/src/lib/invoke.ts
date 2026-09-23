/**
 * The UI's one way to call a Tauri command.
 *
 * Wraps `@tauri-apps/api/core`'s `invoke` so every failed command reaches the
 * log file with its name and error (ADR-036). Tauri does not let the webview
 * hook `invoke` itself: `__TAURI_INTERNALS__.invoke` is a read-only property.
 */

import { invoke as tauriInvoke, InvokeArgs, InvokeOptions } from "@tauri-apps/api/core";
import { recordCommandFailure, recordCommandOk } from "./logging";

export async function invoke<T>(
  cmd: string,
  args?: InvokeArgs,
  options?: InvokeOptions
): Promise<T> {
  const startedAt = performance.now();
  try {
    const result = await tauriInvoke<T>(cmd, args, options);
    recordCommandOk(cmd, startedAt);
    return result;
  } catch (error) {
    recordCommandFailure(cmd, startedAt, error);
    throw error;
  }
}
