import { describe, it, expect } from "vitest";
import { SandboxConfigSchema, StartSandboxConfigSchema } from "../../types/sandbox";

describe("SandboxConfigSchema", () => {
  it("parses a minimal valid config with defaults", () => {
    const result = SandboxConfigSchema.parse({});
    expect(result.provider).toBe("cloudflare");
    expect(result.base).toBe("openclaw");
    expect(result.keepAlive).toBe(false);
    expect(result.vcpus).toBe(2);
    expect(result.memory).toBe(8);
    expect(result.disk).toBe(16);
    expect(result.secrets).toEqual([]);
    expect(result.variables).toEqual([]);
  });

  it("parses a full valid config", () => {
    const result = SandboxConfigSchema.parse({
      name: "my-sandbox",
      provider: "cloudflare",
      base: "nix",
      keepAlive: true,
      vcpus: 4,
      memory: 16,
      disk: 32,
      sleepAfter: "30m",
      secrets: [{ name: "TOKEN", value: "secret123" }],
      variables: [{ name: "PORT", value: "3000" }],
    });
    expect(result.name).toBe("my-sandbox");
    expect(result.base).toBe("nix");
    expect(result.sleepAfter).toBe("30m");
    expect(result.secrets).toHaveLength(1);
    expect(result.variables).toHaveLength(1);
  });

  it("rejects an invalid provider", () => {
    expect(() =>
      SandboxConfigSchema.parse({ provider: "aws" }),
    ).toThrow();
  });

  it("rejects an invalid base image", () => {
    expect(() =>
      SandboxConfigSchema.parse({ base: "unknown-base" }),
    ).toThrow();
  });

  it("rejects invalid sleepAfter format", () => {
    expect(() =>
      SandboxConfigSchema.parse({ sleepAfter: "2d" }),
    ).toThrow();
    expect(() =>
      SandboxConfigSchema.parse({ sleepAfter: "abc" }),
    ).toThrow();
  });

  it("accepts valid sleepAfter formats", () => {
    expect(SandboxConfigSchema.parse({ sleepAfter: "1h" }).sleepAfter).toBe("1h");
    expect(SandboxConfigSchema.parse({ sleepAfter: "30m" }).sleepAfter).toBe("30m");
    expect(SandboxConfigSchema.parse({ sleepAfter: "60s" }).sleepAfter).toBe("60s");
  });

  it("rejects duplicate secret names", () => {
    expect(() =>
      SandboxConfigSchema.parse({
        secrets: [
          { name: "TOKEN", value: "a" },
          { name: "TOKEN", value: "b" },
        ],
      }),
    ).toThrow();
  });

  it("rejects duplicate variable names", () => {
    expect(() =>
      SandboxConfigSchema.parse({
        variables: [
          { name: "PORT", value: "3000" },
          { name: "PORT", value: "4000" },
        ],
      }),
    ).toThrow();
  });

  it("rejects non-positive vcpus/memory/disk", () => {
    expect(() => SandboxConfigSchema.parse({ vcpus: 0 })).toThrow();
    expect(() => SandboxConfigSchema.parse({ memory: -1 })).toThrow();
    expect(() => SandboxConfigSchema.parse({ disk: 0 })).toThrow();
  });
});

describe("StartSandboxConfigSchema", () => {
  it("parses a minimal config with defaults", () => {
    const result = StartSandboxConfigSchema.parse({});
    expect(result.keepAlive).toBe(false);
    expect(result.repo).toBeUndefined();
  });

  it("parses a full config", () => {
    const result = StartSandboxConfigSchema.parse({
      repo: "https://github.com/org/repo",
      keepAlive: true,
    });
    expect(result.repo).toBe("https://github.com/org/repo");
    expect(result.keepAlive).toBe(true);
  });
});
