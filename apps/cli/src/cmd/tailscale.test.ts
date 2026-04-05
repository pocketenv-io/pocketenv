import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { putAuthKey, getTailscaleAuthKey } from "./tailscale";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("../theme", () => ({
  c: {
    primary: (s: string | number) => String(s),
  },
}));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn() },
}));
vi.mock("@inquirer/prompts", () => ({
  password: vi.fn().mockResolvedValue("tskey-auth-abc123"),
}));

describe("tailscale commands", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("putAuthKey", () => {
    it("saves Tailscale auth key and logs success", async () => {
      const mockSandbox = {
        tailscale: { setAuthKey: vi.fn().mockResolvedValue(undefined) },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await putAuthKey("my-sandbox");

      expect(mockSandbox.tailscale.setAuthKey).toHaveBeenCalledWith(
        "tskey-auth-abc123",
      );
      expect(consola.success).toHaveBeenCalledWith(
        expect.stringContaining("my-sandbox"),
      );
    });

    it("logs error and exits when saving fails", async () => {
      vi.mocked(Sandbox.get).mockRejectedValue(new Error("API error"));

      await putAuthKey("my-sandbox");

      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to save Tailscale auth key"),
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("getTailscaleAuthKey", () => {
    it("retrieves and logs the Tailscale auth key", async () => {
      const mockSandbox = {
        tailscale: {
          getAuthKey: vi
            .fn()
            .mockResolvedValue({ authKey: "tskey-auth-abc123" }),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await getTailscaleAuthKey("my-sandbox");

      expect(consola.info).toHaveBeenCalledWith(
        expect.stringContaining("tskey-auth-abc123"),
      );
    });

    it("logs error and exits when key not found", async () => {
      const mockSandbox = {
        tailscale: {
          getAuthKey: vi.fn().mockRejectedValue(new Error("Not found")),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await getTailscaleAuthKey("my-sandbox");

      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining("No Tailscale Auth Key found"),
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});
