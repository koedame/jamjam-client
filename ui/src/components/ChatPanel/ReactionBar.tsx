/**
 * ReactionBar - Display reactions below a message
 * MixerPanel design guide: monochrome, no border-radius
 */
import { ReactionButton } from "./ReactionButton";
import "./ReactionBar.css";

export interface Reaction {
  emoji: string;
  count: number;
  isActive: boolean;
}

export interface ReactionBarProps {
  /** List of reactions to display */
  reactions: Reaction[];
  /** Callback when a reaction is clicked */
  onReactionClick?: (emoji: string) => void;
  /** Disable all reactions */
  disabled?: boolean;
}

export function ReactionBar({
  reactions,
  onReactionClick,
  disabled = false,
}: ReactionBarProps) {
  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className="reaction-bar">
      {reactions.map((reaction) => (
        <ReactionButton
          key={reaction.emoji}
          emoji={reaction.emoji}
          count={reaction.count}
          isActive={reaction.isActive}
          onClick={() => onReactionClick?.(reaction.emoji)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default ReactionBar;
