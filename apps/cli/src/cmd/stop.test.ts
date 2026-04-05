import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import stop from "./stop";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn() },
}));

describe("stop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stops a sandbox and logs success", async () => {
    const mockSandbox = { stop: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await stop("my-sandbox");

    expect(Sandbox.get).toHaveBeenCalledWith("my-sandbox");
    expect(mockSandbox.stop).toHaveBeenCalledOnce();
    expect(consola.success).toHaveBeenCalledOnce();
  });

  it("logs an error when sandbox retrieval fails", async () => {
    vi.mocked(Sandbox.get).mockRejectedValue(new Error("Not found"));

    await stop("my-sandbox");

    expect(consola.error).toHaveBeenCalledWith("Failed to stop sandbox");
  });

  it("logs an error when stop() throws", async () => {
    const mockSandbox = {
      stop: vi.fn().mockRejectedValue(new Error("Stop failed")),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await stop("my-sandbox");

    expect(consola.error).toHaveBeenCalledWith("Failed to stop sandbox");
  });
});
