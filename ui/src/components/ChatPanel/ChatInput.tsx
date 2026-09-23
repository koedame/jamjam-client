/**
 * ChatInput - Multi-line text input with send button
 * MixerPanel design guide: 1px border, no border-radius
 */
import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { useTranslation } from "react-i18next";
import "./ChatInput.css";

export interface ChatInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Callback when message is sent */
  onSend: (message: string) => void;
  /** Disable input */
  disabled?: boolean;
  /** Maximum rows before scrolling */
  maxRows?: number;
  /** Send button label for accessibility */
  sendLabel?: string;
}

export function ChatInput({
  placeholder,
  onSend,
  disabled = false,
  maxRows = 4,
  sendLabel,
}: ChatInputProps) {
  const { t } = useTranslation();
  const placeholderText = placeholder ?? t("chat.placeholder");
  const sendLabelText = sendLabel ?? t("chat.sendLabel");
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = "auto";
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const maxHeight = lineHeight * maxRows;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    },
    [maxRows]
  );

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Cmd+Enter (macOS) or Ctrl+Enter (Windows/Linux) sends the message
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
      // Enter or Shift+Enter allows newline (default behavior)
    },
    [handleSend]
  );

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="chat-input">
      <textarea
        ref={textareaRef}
        className="chat-input__textarea"
        data-testid="chat-input"
        placeholder={placeholderText}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        aria-label={placeholderText}
      />
      <button
        className="chat-input__send-btn"
        data-testid="chat-send"
        onClick={handleSend}
        disabled={!canSend}
        aria-label={sendLabelText}
        type="button"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}

export default ChatInput;
