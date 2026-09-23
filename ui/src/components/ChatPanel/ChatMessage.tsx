/**
 * ChatMessage - Single chat message display
 * jamjam brand guide (ui.pen Screens/Main chatPanel): flat layout with a
 * sender/timestamp header row above the message body, and system (join/leave)
 * messages shown inline with a lucide log-in/log-out icon.
 */
import { useTranslation } from "react-i18next";
import { ReactionBar, type Reaction } from "./ReactionBar";
import { AddReactionButton } from "./AddReactionButton";
import "./ChatMessage.css";

export type ChatMessageType = "own" | "other" | "system";

export interface ChatMessageProps {
  /** Message type determines visual style */
  type: ChatMessageType;
  /**
   * Sender name. For a system message carrying `systemKind` it is the
   * participant the event is about (empty when unknown).
   */
  senderName?: string;
  /** Message content (ignored for a system message carrying `systemKind`) */
  content: string;
  /** Timestamp in milliseconds */
  timestamp: number;
  /** Optional: format time in specific locale (defaults to the UI language) */
  locale?: string;
  /** Optional: reactions on this message */
  reactions?: Reaction[];
  /** Optional: callback when a reaction is clicked */
  onReactionClick?: (emoji: string) => void;
  /** Optional: callback when adding a new reaction */
  onAddReaction?: (emoji: string) => void;
  /** Recently used emojis for picker */
  recentEmojis?: string[];
  /** Show action bar on hover (default: true if onAddReaction is provided) */
  showActions?: boolean;
  /**
   * "join"/"leave" for a system message, straight from the backend. The
   * text is then rendered from the UI language and `senderName`, so the
   * backend sends no display text. When omitted (e.g. Storybook mocks),
   * `content` is shown as-is and the kind is inferred from it - see
   * `inferSystemKind`.
   */
  systemKind?: "join" | "leave" | null;
}

/**
 * Format timestamp to HH:MM format
 */
function formatTime(timestamp: number, locale: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Fallback classifier used only when the caller doesn't supply `systemKind`
 * (e.g. Storybook mocks). Keyword matching on free text is inherently
 * unreliable - e.g. a display name containing "leave" as a substring - so
 * real messages should always come with the backend's authoritative field.
 */
export function inferSystemKind(content: string): "join" | "leave" | null {
  if (/参加|入室|join/i.test(content)) return "join";
  if (/退出|退室|left|leave/i.test(content)) return "leave";
  return null;
}

function LogInIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function ChatMessage({
  type,
  senderName,
  content,
  timestamp,
  locale,
  reactions = [],
  onReactionClick,
  onAddReaction,
  recentEmojis = [],
  showActions,
  systemKind,
}: ChatMessageProps) {
  const { t, i18n } = useTranslation();
  const timeLocale = locale ?? i18n.language;
  const shouldShowActions = showActions ?? !!onAddReaction;

  if (type === "system") {
    const kind = systemKind ?? inferSystemKind(content);
    let text = content;
    if (systemKind === "join") {
      text = t("chat.system.joined", { name: senderName });
    } else if (systemKind === "leave") {
      text = senderName
        ? t("chat.system.left", { name: senderName })
        : t("chat.system.leftUnknown");
    }
    return (
      <div className="chat-message chat-message--system">
        {kind && (
          <span className="chat-message__system-icon">
            {kind === "join" ? <LogInIcon /> : <LogOutIcon />}
          </span>
        )}
        <span className="chat-message__system-content">{text}</span>
        <span className="chat-message__time">{formatTime(timestamp, timeLocale)}</span>
      </div>
    );
  }

  return (
    <div className={`chat-message chat-message--${type}`} data-testid="chat-message" data-message-type={type}>
      <div className="chat-message__header">
        {senderName && <span className="chat-message__sender">{senderName}</span>}
        <span className="chat-message__time">{formatTime(timestamp, timeLocale)}</span>
      </div>
      <div className="chat-message__content">{content}</div>
      {(reactions.length > 0 || shouldShowActions) && (
        <div className="chat-message__reactions">
          {reactions.length > 0 && (
            <ReactionBar reactions={reactions} onReactionClick={onReactionClick} />
          )}
          {shouldShowActions && (
            <AddReactionButton
              onSelect={onAddReaction}
              recentEmojis={recentEmojis}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
