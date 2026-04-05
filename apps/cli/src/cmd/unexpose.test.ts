import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { unexposePort } from "./unexpose";

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

describe("unexposePort", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unexposes a port and logs success", async () => {
    const mockSandbox = {
      unexpose: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await unexposePort("my-sandbox", 3000);

    expect(mockSandbox.unexpose).toHaveBeenCalledWith(3000);
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining("3000"),
    );
  });

  it("logs error and exits on failure", async () => {
    vi.mocked(Sandbox.get).mockRejectedValue(new Error("API error"));

    await unexposePort("my-sandbox", 3000);

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to unexpose port"),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
