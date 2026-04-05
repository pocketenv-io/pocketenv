import { describe, it, expect } from "vitest";
import {
  toErrorMessage,
  generateSandboxId,
} from "../lib/sandbox-helpers";

describe("toErrorMessage", () => {
  it("returns the message from an Error instance", () => {
    const err = new Error("something went wrong");
    expect(toErrorMessage(err)).toBe("something went wrong");
  });

  it("returns 'Unknown error' for a non-Error value", () => {
    expect(toErrorMessage("just a string")).toBe("Unknown error");
    expect(toErrorMessage(42)).toBe("Unknown error");
    expect(toErrorMessage(null)).toBe("Unknown error");
    expect(toErrorMessage(undefined)).toBe("Unknown error");
    expect(toErrorMessage({ message: "object" })).toBe("Unknown error");
  });
});

describe("generateSandboxId", () => {
  it("returns a 32-character hex string", () => {
    const id = generateSandboxId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });

  it("generates unique ids across calls", () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateSandboxId()));
    expect(ids.size).toBe(20);
  });
});
