/**
 * EmojiPicker - Simple emoji picker with categories
 * MixerPanel design guide: monochrome, no border-radius
 */
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "./EmojiPicker.css";

/** Emoji categories with common emojis */
export const EMOJI_CATEGORIES = {
  recent: [] as string[],
  smileys: [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
    "🙂", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘",
    "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭",
    "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒",
    "🙄", "😬", "😮", "😯", "😲", "😳", "🥺", "😢",
    "😭", "😤", "😠", "😡", "🤬", "😈", "👿", "💀",
  ],
  gestures: [
    "👍", "👎", "👏", "🙌", "🤝", "👊", "✊", "🤛",
    "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤌", "🤏",
    "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️",
    "🖖", "👋", "🤙", "💪", "🙏", "✍️", "🤳", "💅",
  ],
  hearts: [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
    "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
    "💘", "💝", "💟", "♥️", "🫀", "💌", "😻", "🥰",
  ],
  music: [
    "🎵", "🎶", "🎼", "🎹", "🎸", "🎺", "🎷", "🪗",
    "🎻", "🪕", "🥁", "🎤", "🎧", "🎙️", "📻", "🔊",
    "🔉", "🔈", "🔇", "📢", "📣", "🎚️", "🎛️", "🎵",
  ],
  objects: [
    "⭐", "🌟", "✨", "💫", "🔥", "💥", "💯", "🎉",
    "🎊", "🎁", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️",
    "📌", "📍", "🔔", "🔕", "💡", "🔦", "⏰", "⌚",
  ],
} as const;

export type EmojiCategory = keyof typeof EMOJI_CATEGORIES;

export interface EmojiPickerProps {
  /** Callback when an emoji is selected */
  onSelect?: (emoji: string) => void;
  /** Callback to close the picker */
  onClose?: () => void;
  /** Recently used emojis */
  recentEmojis?: string[];
  /** Disable selection */
  disabled?: boolean;
}

const CATEGORY_ICONS: Record<EmojiCategory, string> = {
  recent: "🕐",
  smileys: "😀",
  gestures: "👍",
  hearts: "❤️",
  music: "🎵",
  objects: "⭐",
};

export function EmojiPicker({
  onSelect,
  onClose,
  recentEmojis = [],
  disabled = false,
}: EmojiPickerProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<EmojiCategory>(
    recentEmojis.length > 0 ? "recent" : "smileys"
  );

  const handleEmojiClick = useCallback(
    (emoji: string) => {
      onSelect?.(emoji);
    },
    [onSelect]
  );

  const getEmojisForCategory = (category: EmojiCategory): string[] => {
    if (category === "recent") {
      return recentEmojis;
    }
    return [...EMOJI_CATEGORIES[category]];
  };

  const currentEmojis = getEmojisForCategory(activeCategory);
  const showRecent = recentEmojis.length > 0;

  return (
    <div className="emoji-picker" role="dialog" aria-label={t("chat.emoji.picker")}>
      {/* Header with close button */}
      <div className="emoji-picker__header">
        <span className="emoji-picker__title">{t("chat.emoji.title")}</span>
        {onClose && (
          <button
            type="button"
            className="emoji-picker__close"
            onClick={onClose}
            aria-label={t("chat.emoji.close")}
          >
            ×
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="emoji-picker__categories" role="tablist">
        {(Object.keys(EMOJI_CATEGORIES) as EmojiCategory[])
          .filter((cat) => cat !== "recent" || showRecent)
          .map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              className={`emoji-picker__category ${activeCategory === category ? "emoji-picker__category--active" : ""}`}
              onClick={() => setActiveCategory(category)}
              aria-selected={activeCategory === category}
              aria-label={t(`chat.emoji.${category}`)}
              title={t(`chat.emoji.${category}`)}
            >
              {CATEGORY_ICONS[category]}
            </button>
          ))}
      </div>

      {/* Emoji grid */}
      <div className="emoji-picker__grid" role="tabpanel">
        {currentEmojis.length > 0 ? (
          currentEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              type="button"
              className="emoji-picker__emoji"
              onClick={() => handleEmojiClick(emoji)}
              disabled={disabled}
              aria-label={emoji}
            >
              {emoji}
            </button>
          ))
        ) : (
          <div className="emoji-picker__empty">
            {activeCategory === "recent"
              ? t("chat.emoji.recentEmpty")
              : t("chat.emoji.empty")}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmojiPicker;
