import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { listVolumes, createVolume, deleteVolume } from "./volume";

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

describe("volume commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listVolumes", () => {
    it("lists volumes and logs a table", async () => {
      const mockSandbox = {
        volume: {
          list: vi.fn().mockResolvedValue({
            volumes: [
              {
                id: "vol-1",
                name: "data",
                path: "/data",
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await listVolumes("my-sandbox");

      expect(mockSandbox.volume.list).toHaveBeenCalledOnce();
      expect(consola.log).toHaveBeenCalledOnce();
    });

    it("logs an empty table when no volumes exist", async () => {
      const mockSandbox = {
        volume: { list: vi.fn().mockResolvedValue({ volumes: [] }) },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await listVolumes("my-sandbox");

      expect(consola.log).toHaveBeenCalledOnce();
    });
  });

  describe("createVolume", () => {
    it("creates a volume and logs success", async () => {
      const mockSandbox = {
        volume: { create: vi.fn().mockResolvedValue(undefined) },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await createVolume("my-sandbox", "data", "/data");

      expect(mockSandbox.volume.create).toHaveBeenCalledWith("data", {
        path: "/data",
      });
      expect(consola.success).toHaveBeenCalledWith(
        expect.stringContaining("data"),
      );
    });

    it("logs error when volume creation fails", async () => {
      const mockSandbox = {
        volume: {
          create: vi.fn().mockRejectedValue(new Error("Create failed")),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await createVolume("my-sandbox", "data", "/data");

      expect(consola.error).toHaveBeenCalledWith(
        "Failed to create volume:",
        expect.any(Error),
      );
    });
  });

  describe("deleteVolume", () => {
    it("deletes a volume via API and logs success", async () => {
      await deleteVolume("vol-1");

      expect(client.post).toHaveBeenCalledWith(
        "/xrpc/io.pocketenv.volume.deleteVolume",
        undefined,
        expect.objectContaining({ params: { id: "vol-1" } }),
      );
      expect(consola.success).toHaveBeenCalledWith(
        expect.stringContaining("vol-1"),
      );
    });

    it("logs error when deletion fails", async () => {
      vi.mocked(client.post).mockRejectedValue(new Error("API error"));

      await deleteVolume("vol-1");

      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to delete volume"),
      );
    });
  });
});
