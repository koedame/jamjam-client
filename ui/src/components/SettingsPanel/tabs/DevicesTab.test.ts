/**
 * Tests for DevicesTab's one-way latency tone classifier.
 */
import { describe, it, expect } from "vitest";
import { latencyTone } from "./DevicesTab";

describe("latencyTone", () => {
  it("returns the good tone at 0ms", () => {
    expect(latencyTone(0)).toBe("latency-card__value--good");
  });

  it("returns the good tone at the 3ms boundary (inclusive)", () => {
    expect(latencyTone(3)).toBe("latency-card__value--good");
  });

  it("returns the warn tone just above the good boundary", () => {
    expect(latencyTone(3.1)).toBe("latency-card__value--warn");
  });

  it("returns the warn tone at the 6ms boundary (inclusive)", () => {
    expect(latencyTone(6)).toBe("latency-card__value--warn");
  });

  it("returns the bad tone just above the warn boundary", () => {
    expect(latencyTone(6.1)).toBe("latency-card__value--bad");
  });

  it("returns the bad tone for large latency values", () => {
    expect(latencyTone(50)).toBe("latency-card__value--bad");
  });
});
