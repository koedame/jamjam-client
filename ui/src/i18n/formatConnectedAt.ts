/**
 * Connection history date: time today, "Yesterday", "N days ago" within a
 * week, then month and day. Every part follows the UI language, not the
 * system locale.
 */

import type { TFunction } from 'i18next';

export function formatConnectedAt(isoString: string, t: TFunction, language: string): string {
  const date = new Date(isoString);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return t('connectionHistory.yesterday');
  } else if (diffDays < 7) {
    return t('connectionHistory.daysAgo', { days: diffDays });
  }
  return date.toLocaleDateString(language, { month: 'short', day: 'numeric' });
}
