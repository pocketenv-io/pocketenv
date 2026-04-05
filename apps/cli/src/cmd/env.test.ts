import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { listEnvs, putEnv, deleteEnv } from "./env";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("dayjs", () => {
  const mockDayjs: any = vi.fn(() => ({
    fromNow: vi.fn().mockReturnValue("2 days ago"),
  }));
  mockDayjs.extend = vi.fn();
  return { default: mockDayjs };
});
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

import { client } from "../client";

describe("env commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listEnvs", () => {
    it("lists env variables and logs a table", async () => {
      const mockSandbox = {
        env: {
          list: vi.fn().mockResolvedValue({
            variables: [
              {
                id: "var-1",
                name: "MY_VAR",
                value: "hello",
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await listEnvs("my-sandbox");

      expect(mockSandbox.env.list).toHaveBeenCalledWith({ limit: 100, offset: 0 });
      expect(consola.log).toHaveBeenCalledOnce();
    });

    it("logs an empty table when no variables exist", async () => {
      const mockSandbox = {
        env: { list: vi.fn().mockResolvedValue({ variables: [] }) },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await listEnvs("my-sandbox");

      expect(consola.log).toHaveBeenCalledOnce();
    });
  });

  describe("putEnv", () => {
    it("updates a variable and logs success", async () => {
      const mockSandbox = {
        env: { put: vi.fn().mockResolvedValue(undefined) },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await putEnv("my-sandbox", "MY_VAR", "my-value");

      expect(mockSandbox.env.put).toHaveBeenCalledWith("MY_VAR", "my-value");
      expect(consola.success).toHaveBeenCalledWith("Variable updated successfully");
    });
  });

  describe("deleteEnv", () => {
    it("deletes a variable and logs success", async () => {
      await deleteEnv("var-1");

      expect(client.post).toHaveBeenCalledWith(
        "/xrpc/io.pocketenv.variable.deleteVariable",
        undefined,
        expect.objectContaining({ params: { id: "var-1" } }),
      );
      expect(consola.success).toHaveBeenCalledWith("Variable deleted successfully");
    });

    it("logs an error when deletion fails", async () => {
      vi.mocked(client.post).mockRejectedValue(new Error("API error"));

      await deleteEnv("var-1");

      expect(consola.error).toHaveBeenCalledWith("Failed to delete variable");
    });
  });
});
