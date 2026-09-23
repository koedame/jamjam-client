/**
 * ConnectionHistory - Display and manage connection history
 */

import { useTranslation } from "react-i18next";
import { formatConnectedAt } from "../../i18n/formatConnectedAt";
import type { ConnectionHistoryEntry } from "../../lib/tauri";
import "./ConnectionHistory.css";

export interface ConnectionHistoryProps {
  /** Connection history entries */
  history: ConnectionHistoryEntry[];
  /** Called when user selects a history entry */
  onSelect: (roomCode: string) => void;
  /** Called when user wants to remove an entry */
  onRemove: (roomCode: string) => void;
  /** Whether the component is in loading state */
  isLoading?: boolean;
}

export function ConnectionHistory({
  history,
  onSelect,
  onRemove,
  isLoading = false,
}: ConnectionHistoryProps) {
  const { t, i18n } = useTranslation();

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="connection-history">
      <h3 className="connection-history__title">
        {t("connectionHistory.title")}
      </h3>
      <ul className="connection-history__list">
        {history.map((entry) => (
          <li key={entry.room_code} className="connection-history__item">
            <button
              className="connection-history__select-btn"
              onClick={() => onSelect(entry.room_code)}
              disabled={isLoading}
            >
              <div className="connection-history__info">
                <span className="connection-history__code">
                  {entry.room_code}
                </span>
                {entry.label && (
                  <span className="connection-history__label">
                    {entry.label}
                  </span>
                )}
              </div>
              <span className="connection-history__date">
                {formatConnectedAt(entry.connected_at, t, i18n.language)}
              </span>
            </button>
            <button
              className="connection-history__remove-btn"
              onClick={() => onRemove(entry.room_code)}
              disabled={isLoading}
              aria-label={t("connectionHistory.remove")}
              title={t("connectionHistory.remove")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
