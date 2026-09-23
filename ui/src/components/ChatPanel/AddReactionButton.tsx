/**
 * AddReactionButton - Single button to add a reaction
 * Opens emoji picker on click
 */
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { EmojiPicker } from "./EmojiPicker";
import "./AddReactionButton.css";

export interface AddReactionButtonProps {
  /** Callback when an emoji is selected */
  onSelect?: (emoji: string) => void;
  /** Recently used emojis for the picker */
  recentEmojis?: string[];
  /** Disable the button */
  disabled?: boolean;
}

export function AddReactionButton({
  onSelect,
  recentEmojis = [],
  disabled = false,
}: AddReactionButtonProps) {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);

  const handleClick = useCallback(() => {
    if (!disabled) {
      setShowPicker((prev) => !prev);
    }
  }, [disabled]);

  const handleSelect = useCallback(
    (emoji: string) => {
      onSelect?.(emoji);
      setShowPicker(false);
    },
    [onSelect]
  );

  const handleClose = useCallback(() => {
    setShowPicker(false);
  }, []);

  return (
    <div className="add-reaction-button">
      <button
        type="button"
        className="add-reaction-button__trigger"
        onClick={handleClick}
        disabled={disabled}
        aria-label={t("chat.addReaction")}
        aria-expanded={showPicker}
      >
        <span className="add-reaction-button__icon">☺</span>
      </button>
      {showPicker && (
        <div className="add-reaction-button__picker">
          <EmojiPicker
            onSelect={handleSelect}
            onClose={handleClose}
            recentEmojis={recentEmojis}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

export default AddReactionButton;
