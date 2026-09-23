/**
 * ReactionButton - Single emoji reaction button with count
 * MixerPanel design guide: monochrome, no border-radius
 */
import { useTranslation } from "react-i18next";
import "./ReactionButton.css";

export interface ReactionButtonProps {
  /** The emoji character */
  emoji: string;
  /** Number of reactions */
  count: number;
  /** Whether the current user has reacted */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Disable the button */
  disabled?: boolean;
}

export function ReactionButton({
  emoji,
  count,
  isActive = false,
  onClick,
  disabled = false,
}: ReactionButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={`reaction-button ${isActive ? "reaction-button--active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={t("chat.reaction.label", { emoji, count })}
      aria-pressed={isActive}
    >
      <span className="reaction-button__emoji">{emoji}</span>
      {count > 0 && <span className="reaction-button__count">{count}</span>}
    </button>
  );
}

export default ReactionButton;
