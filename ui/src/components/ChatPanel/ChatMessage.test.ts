/**
 * Tests for ChatMessage's fallback system-message classifier.
 */
import { describe, it, expect } from "vitest";
import { inferSystemKind } from "./ChatMessage";

describe("inferSystemKind", () => {
  it("classifies Japanese join messages", () => {
    expect(inferSystemKind("Alice が参加しました")).toBe("join");
  });

  it("classifies Japanese leave messages", () => {
    expect(inferSystemKind("Alice が退出しました")).toBe("leave");
  });

  it("classifies English join messages", () => {
    expect(inferSystemKind("Alice has joined the room")).toBe("join");
  });

  it("classifies English leave messages", () => {
    expect(inferSystemKind("Alice has left the room")).toBe("leave");
  });

  it("returns null for content matching neither keyword set", () => {
    expect(inferSystemKind("Hello, how is everyone doing?")).toBeNull();
  });

  it("is case-insensitive", () => {
    expect(inferSystemKind("ALICE HAS JOINED")).toBe("join");
    expect(inferSystemKind("ALICE HAS LEFT")).toBe("leave");
  });

  it("prefers join when both keyword sets appear (join checked first)", () => {
    expect(inferSystemKind("X has left; Y has joined")).toBe("join");
  });

  it("misclassifies a name that itself contains a keyword substring (documents the known limitation)", () => {
    // "Joan" contains "Joan" which is not literally "join", but names like
    // "Cleft" (containing "left") DO trip the leave pattern - this is the
    // exact false-positive risk that makes the backend's systemKind field
    // (see ChatPanelAdapter's convertMessage) authoritative in real usage.
    expect(inferSystemKind("Cleft has entered the chat")).toBe("leave");
  });
});
