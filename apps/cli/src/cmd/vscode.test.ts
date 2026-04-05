import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { exposeVscode } from "./vscode";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("../theme", () => ({
  c: {
    primary: (s: string | number) => String(s),
  },
}));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn() },
}));

describe("exposeVscode", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes VS Code and logs success", async () => {
    const mockSandbox = {
      vscode: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await exposeVscode("my-sandbox");

    expect(Sandbox.get).toHaveBeenCalledWith("my-sandbox");
    expect(mockSandbox.vscode).toHaveBeenCalledOnce();
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining("my-sandbox"),
    );
  });

  it("logs error and exits on failure", async () => {
    vi.mocked(Sandbox.get).mockRejectedValue(new Error("API error"));

    await exposeVscode("my-sandbox");

    expect(consola.error).toHaveBeenCalledWith(
      "Failed to expose VS Code:",
      expect.any(Error),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
