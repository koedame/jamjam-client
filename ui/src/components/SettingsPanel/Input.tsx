/**
 * Input - Text input component
 *
 * Design: MixerPanel tone & manner (monochrome, 1px borders, no rounded corners)
 */

import { InputHTMLAttributes } from "react";
import "./Input.css";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Error state */
  hasError?: boolean;
  /** Change handler */
  onChange?: (value: string) => void;
}

export function Input({
  hasError,
  onChange,
  disabled,
  ...props
}: InputProps) {
  return (
    <input
      className={`input ${hasError ? "input--error" : ""}`}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      {...props}
    />
  );
}

export default Input;
