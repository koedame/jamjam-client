/**
 * QuickReactions - Quick access bar for 5 default emojis
 * Default emojis: 👍 ❤️ 😄 🎵 👏
 * MixerPanel design guide: monochrome, no border-radius
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./QuickReactions.css";

/** Default quick reaction emojis */
export const DEFAULT_QUICK_EMOJIS = ["👍", "❤️", "😄", "🎵", "👏"] as const;

export interface QuickReactionsProps {
  /** Callback when an emoji is selected */
  onSelect?: (emoji: string) => void;
  /** Callback to open the full emoji picker */
  onOpenPicker?: () => void;
  /** Custom quick emojis (defaults to 5 standard emojis) */
  quickEmojis?: string[];
  /** Disable all buttons */
  disabled?: boolean;
  /** Show the "more" button to open picker */
  showMoreButton?: boolean;
}

export function QuickReactions({
  onSelect,
  onOpenPicker,
  quickEmojis = [...DEFAULT_QUICK_EMOJIS],
  disabled = false,
  showMoreButton = true,
}: QuickReactionsProps) {
  const { t } = useTranslation();
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  return (
    <div className="quick-reactions" role="group" aria-label={t("chat.reaction.quick")}>
      {quickEmojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className={`quick-reactions__button ${hoveredEmoji === emoji ? "quick-reactions__button--hovered" : ""}`}
          onClick={() => onSelect?.(emoji)}
          onMouseEnter={() => setHoveredEmoji(emoji)}
          onMouseLeave={() => setHoveredEmoji(null)}
          disabled={disabled}
          aria-label={t("chat.reaction.react", { emoji })}
        >
          {emoji}
        </button>
      ))}
      {showMoreButton && (
        <button
          type="button"
          className="quick-reactions__button quick-reactions__button--more"
          onClick={onOpenPicker}
          disabled={disabled}
          aria-label={t("chat.reaction.more")}
        >
          +
        </button>
      )}
    </div>
  );
}

export default QuickReactions;
