/**
 * MessageActions - Hover action bar for chat messages
 * Shows quick reactions and more button on message hover
 */
import { useState, useCallback } from "react";
import { QuickReactions } from "./QuickReactions";
import { EmojiPicker } from "./EmojiPicker";
import "./MessageActions.css";

export interface MessageActionsProps {
  /** Callback when a reaction is selected */
  onReaction?: (emoji: string) => void;
  /** Recently used emojis for the picker */
  recentEmojis?: string[];
  /** Disable actions */
  disabled?: boolean;
}

export function MessageActions({
  onReaction,
  recentEmojis = [],
  disabled = false,
}: MessageActionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = useCallback(
    (emoji: string) => {
      onReaction?.(emoji);
      setShowPicker(false);
    },
    [onReaction]
  );

  const handleOpenPicker = useCallback(() => {
    setShowPicker(true);
  }, []);

  const handleClosePicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  return (
    <div className="message-actions">
      <QuickReactions
        onSelect={handleSelect}
        onOpenPicker={handleOpenPicker}
        disabled={disabled}
      />
      {showPicker && (
        <div className="message-actions__picker">
          <EmojiPicker
            onSelect={handleSelect}
            onClose={handleClosePicker}
            recentEmojis={recentEmojis}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

export default MessageActions;
