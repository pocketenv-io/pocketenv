import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { getSshKey, putKeys } from "./sshkeys";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn() },
}));
vi.mock("@inquirer/prompts", () => ({
  editor: vi.fn().mockResolvedValue(
    "-----BEGIN OPENSSH PRIVATE KEY-----\nfake\n-----END OPENSSH PRIVATE KEY-----",
  ),
  input: vi.fn().mockResolvedValue("ssh-ed25519 AAAAC3NzaC1lZDI1NTE5 user@host"),
}));
vi.mock("node:fs/promises", () => ({
  default: { readFile: vi.fn().mockResolvedValue("file-key-content") },
}));

describe("sshkeys commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSshKey", () => {
    it("logs SSH keys for a sandbox", async () => {
      const mockSandbox = {
        sshKeys: {
          get: vi.fn().mockResolvedValue({
            privateKey: "-----BEGIN OPENSSH PRIVATE KEY-----\\nfakekey\\n-----END",
            publicKey: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5 user@host",
          }),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await getSshKey("my-sandbox");

      expect(mockSandbox.sshKeys.get).toHaveBeenCalledOnce();
      expect(consola.log).toHaveBeenCalledWith(
        expect.stringContaining("Private Key"),
      );
      expect(consola.log).toHaveBeenCalledWith(
        expect.stringContaining("Public Key"),
      );
    });

    it("logs info when no SSH keys are found", async () => {
      const mockSandbox = {
        sshKeys: {
          get: vi.fn().mockRejectedValue(new Error("Not found")),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await getSshKey("my-sandbox");

      expect(consola.info).toHaveBeenCalledWith(
        expect.stringContaining("No SSH keys found"),
      );
    });
  });

  describe("putKeys", () => {
    it("generates and saves SSH keys when generate option is true", async () => {
      const mockSandbox = {
        sshKeys: {
          generate: vi.fn().mockResolvedValue({
            privateKey: "-----BEGIN OPENSSH PRIVATE KEY-----\ngenerated\n-----END OPENSSH PRIVATE KEY-----",
            publicKey: "ssh-ed25519 AAAA generated-pub",
          }),
          put: vi.fn().mockResolvedValue(undefined),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await putKeys("my-sandbox", { generate: true });

      expect(mockSandbox.sshKeys.generate).toHaveBeenCalledOnce();
      expect(mockSandbox.sshKeys.put).toHaveBeenCalledWith(
        "ssh-ed25519 AAAA generated-pub",
        "-----BEGIN OPENSSH PRIVATE KEY-----\ngenerated\n-----END OPENSSH PRIVATE KEY-----",
      );
      expect(consola.success).toHaveBeenCalledWith("SSH keys saved successfully!");
    });

    it("logs error when saving SSH keys fails", async () => {
      const mockSandbox = {
        sshKeys: {
          generate: vi.fn().mockResolvedValue({
            privateKey: "-----BEGIN OPENSSH PRIVATE KEY-----\ngenerated\n-----END OPENSSH PRIVATE KEY-----",
            publicKey: "ssh-ed25519 AAAA generated-pub",
          }),
          put: vi.fn().mockRejectedValue(new Error("Save failed")),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await putKeys("my-sandbox", { generate: true });

      expect(consola.error).toHaveBeenCalledWith("Failed to save SSH keys");
    });
  });
});
