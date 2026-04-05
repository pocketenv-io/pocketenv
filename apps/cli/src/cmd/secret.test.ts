import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { listSecrets, putSecret, deleteSecret } from "./secret";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("../lib/getAccessToken", () => ({
  default: vi.fn().mockResolvedValue("test-access-token"),
}));
vi.mock("../lib/env", () => ({
  env: { POCKETENV_TOKEN: "", POCKETENV_API_URL: "https://api.pocketenv.io" },
}));
vi.mock("../theme", () => ({
  c: {
    primary: (s: string | number) => String(s),
    secondary: (s: string | number) => String(s),
    highlight: (s: string | number) => String(s),
  },
}));
vi.mock("../client", () => ({
  client: { post: vi.fn().mockResolvedValue({ data: {} }) },
}));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn() },
}));
vi.mock("@inquirer/prompts", () => ({
  password: vi.fn().mockResolvedValue("super-secret-value"),
}));

import { client } from "../client";
import { password } from "@inquirer/prompts";

describe("secret commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listSecrets", () => {
    it("lists secrets and logs a table", async () => {
      const mockSandbox = {
        secret: {
          list: vi.fn().mockResolvedValue({
            secrets: [
              {
                id: "sec-1",
                name: "API_KEY",
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await listSecrets("my-sandbox");

      expect(mockSandbox.secret.list).toHaveBeenCalledWith({
        limit: 100,
        offset: 0,
      });
      expect(consola.log).toHaveBeenCalledOnce();
    });

    it("logs an empty table when no secrets exist", async () => {
      const mockSandbox = {
        secret: { list: vi.fn().mockResolvedValue({ secrets: [] }) },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await listSecrets("my-sandbox");

      expect(consola.log).toHaveBeenCalledOnce();
    });
  });

  describe("putSecret", () => {
    beforeEach(() => {
      Object.defineProperty(process.stdin, "isTTY", {
        value: true,
        configurable: true,
      });
    });

    it("prompts for value and saves secret", async () => {
      const mockSandbox = {
        secret: { put: vi.fn().mockResolvedValue(undefined) },
        data: { name: "my-sandbox" },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await putSecret("my-sandbox", "API_KEY");

      expect(password).toHaveBeenCalledWith({
        message: "Enter secret value",
      });
      expect(mockSandbox.secret.put).toHaveBeenCalledWith(
        "API_KEY",
        "super-secret-value",
      );
      expect(consola.success).toHaveBeenCalledWith("Secret added successfully");
    });

    it("logs error when sandbox not found", async () => {
      vi.mocked(Sandbox.get).mockRejectedValue(new Error("Not found"));

      await putSecret("my-sandbox", "API_KEY");

      expect(consola.error).toHaveBeenCalledWith(
        "Failed to add secret:",
        expect.any(Error),
      );
    });
  });

  describe("deleteSecret", () => {
    it("deletes a secret via API", async () => {
      await deleteSecret("sec-1");

      expect(client.post).toHaveBeenCalledWith(
        "/xrpc/io.pocketenv.secret.deleteSecret",
        undefined,
        expect.objectContaining({ params: { id: "sec-1" } }),
      );
      expect(consola.success).toHaveBeenCalledWith("Secret deleted successfully");
    });

    it("logs error when deletion fails", async () => {
      vi.mocked(client.post).mockRejectedValue(new Error("API error"));

      await deleteSecret("sec-1");

      expect(consola.error).toHaveBeenCalledWith(
        "Failed to delete secret:",
        expect.any(Error),
      );
    });
  });
});
