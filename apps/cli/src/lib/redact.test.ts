import { describe, it, expect } from "vitest";
import redact from "./redact.ts";

describe("redact", () => {
  it("returns the value unchanged when 14 chars or fewer", () => {
    expect(redact("short")).toBe("short");
    expect(redact("exactly14chars")).toBe("exactly14chars");
  });

  it("redacts strings longer than 14 chars", () => {
    const result = redact("ghp_abcdefghijklmnopqrstuvwxyz");
    expect(result).toMatch(/^ghp_abcdefg\*{24}xyz$/);
  });

  it("keeps the first 11 characters visible", () => {
    const value = "123456789012345";
    const result = redact(value);
    expect(result.startsWith("12345678901")).toBe(true);
  });

  it("keeps the last 3 characters visible", () => {
    const value = "123456789012345";
    const result = redact(value);
    expect(result.endsWith("345")).toBe(true);
  });

  it("uses exactly 24 asterisks in the middle", () => {
    const value = "123456789012345";
    const result = redact(value);
    const middle = result.slice(11, result.length - 3);
    expect(middle).toBe("*".repeat(24));
  });

  it("total length is always 11 + 24 + 3 = 38 for any long string", () => {
    for (const value of [
      "123456789012345",
      "a".repeat(50),
      "ghp_" + "x".repeat(40),
    ]) {
      expect(redact(value).length).toBe(38);
    }
  });

  it("handles a string of exactly 15 chars (boundary)", () => {
    const value = "abcdefghijklmno";
    const result = redact(value);
    expect(result).toBe("abcdefghijk" + "*".repeat(24) + "mno");
  });

  it("handles an empty string", () => {
    expect(redact("")).toBe("");
  });
});
