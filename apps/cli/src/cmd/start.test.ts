import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import start from "./start";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("../lib/expandRepo", () => ({
  expandRepo: vi.fn((repo: string) => repo),
}));
vi.mock("./ssh", () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn() },
}));

import connectToSandbox from "./ssh";

describe("start", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts a sandbox and logs success", async () => {
    const mockSandbox = {
      start: vi.fn().mockResolvedValue(undefined),
      waitUntilRunning: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await start("my-sandbox", {});

    expect(Sandbox.get).toHaveBeenCalledWith("my-sandbox");
    expect(mockSandbox.start).toHaveBeenCalledWith({
      repo: undefined,
      keepAlive: undefined,
    });
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining("my-sandbox"),
    );
  });

  it("connects via SSH when ssh option is set", async () => {
    const mockSandbox = {
      start: vi.fn().mockResolvedValue(undefined),
      waitUntilRunning: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await start("my-sandbox", { ssh: true });

    expect(mockSandbox.waitUntilRunning).toHaveBeenCalledOnce();
    expect(connectToSandbox).toHaveBeenCalledWith("my-sandbox");
    expect(consola.success).not.toHaveBeenCalled();
  });

  it("expands repo URL when provided", async () => {
    const { expandRepo } = await import("../lib/expandRepo");
    const mockSandbox = {
      start: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await start("my-sandbox", { repo: "owner/repo" });

    expect(expandRepo).toHaveBeenCalledWith("owner/repo");
  });

  it("logs error when start fails", async () => {
    vi.mocked(Sandbox.get).mockRejectedValue(new Error("Not found"));

    await start("my-sandbox", {});

    expect(consola.error).toHaveBeenCalledWith("Failed to start sandbox");
  });
});
