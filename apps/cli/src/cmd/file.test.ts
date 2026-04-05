import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { putFile, listFiles, deleteFile } from "./file";

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
    error: (s: string | number) => String(s),
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
vi.mock("fs/promises", () => ({
  default: {
    access: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue("file content"),
  },
}));
vi.mock("@inquirer/prompts", () => ({
  editor: vi.fn().mockResolvedValue("editor content"),
}));

import { client } from "../client";
import fs from "fs/promises";

describe("file commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(process.stdin, "isTTY", {
      value: true,
      configurable: true,
    });
  });

  describe("putFile", () => {
    it("writes file content from local path", async () => {
      const mockSandbox = {
        file: { write: vi.fn().mockResolvedValue(undefined) },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await putFile("my-sandbox", "/remote/path.txt", "./local/file.txt");

      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining("local/file.txt"),
        "utf-8",
      );
      expect(mockSandbox.file.write).toHaveBeenCalledWith(
        "/remote/path.txt",
        "file content",
      );
      expect(consola.success).toHaveBeenCalledWith(
        expect.stringContaining("/remote/path.txt"),
      );
    });

    it("logs error when local file does not exist", async () => {
      const mockExit = vi
        .spyOn(process, "exit")
        .mockImplementation(() => undefined as never);
      vi.mocked(fs.access).mockRejectedValue(
        Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
      );

      await putFile("my-sandbox", "/remote/path.txt", "./missing.txt");

      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining("No such file"),
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("logs error when sandbox write fails", async () => {
      const mockSandbox = {
        file: { write: vi.fn().mockRejectedValue(new Error("Write failed")) },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await putFile("my-sandbox", "/remote/path.txt", "./local/file.txt");

      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to create file"),
      );
    });
  });

  describe("listFiles", () => {
    it("lists files and logs a table", async () => {
      const mockSandbox = {
        file: {
          list: vi.fn().mockResolvedValue({
            files: [
              {
                id: "file-1",
                path: "/etc/config.json",
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await listFiles("my-sandbox");

      expect(mockSandbox.file.list).toHaveBeenCalledOnce();
      expect(consola.log).toHaveBeenCalledOnce();
    });
  });

  describe("deleteFile", () => {
    it("deletes a file via API", async () => {
      await deleteFile("file-1");

      expect(client.post).toHaveBeenCalledWith(
        "/xrpc/io.pocketenv.file.deleteFile",
        undefined,
        expect.objectContaining({ params: { id: "file-1" } }),
      );
      expect(consola.success).toHaveBeenCalledWith(
        expect.stringContaining("file-1"),
      );
    });

    it("logs error when deletion fails", async () => {
      vi.mocked(client.post).mockRejectedValue(new Error("API error"));

      await deleteFile("file-1");

      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to delete file"),
      );
    });
  });
});
