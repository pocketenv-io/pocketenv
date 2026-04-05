import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import {
  createService,
  listServices,
  restartService,
  startService,
  stopService,
  deleteService,
} from "./service";

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

import { client } from "../client";

describe("service commands", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined as never);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(client.post).mockResolvedValue({ data: {} });
  });

  describe("createService", () => {
    it("creates a service and logs success", async () => {
      const mockSandbox = {
        service: { add: vi.fn().mockResolvedValue(undefined) },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await createService("my-sandbox", "web", ["npm", "start"], {
        ports: ["3000"],
        description: "Web server",
      });

      expect(mockSandbox.service.add).toHaveBeenCalledWith("web", "npm start", {
        description: "Web server",
        ports: [3000],
      });
      expect(consola.success).toHaveBeenCalledWith(
        expect.stringContaining("web"),
      );
    });

    it("logs error and exits when creation fails", async () => {
      vi.mocked(Sandbox.get).mockRejectedValue(new Error("Not found"));

      await createService("my-sandbox", "web", ["npm", "start"], {});

      expect(consola.error).toHaveBeenCalledWith(
        "Failed to create service",
        expect.any(Error),
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("listServices", () => {
    it("lists services and logs a table", async () => {
      const mockSandbox = {
        service: {
          list: vi.fn().mockResolvedValue({
            services: [
              {
                id: "svc-1",
                name: "web",
                command: "npm start",
                status: "RUNNING",
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        },
      };
      vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

      await listServices("my-sandbox");

      expect(mockSandbox.service.list).toHaveBeenCalledOnce();
      expect(consola.log).toHaveBeenCalledOnce();
    });

    it("logs error and exits when listing fails", async () => {
      vi.mocked(Sandbox.get).mockRejectedValue(new Error("Not found"));

      await listServices("my-sandbox");

      expect(consola.error).toHaveBeenCalledWith(
        "Failed to list services",
        expect.any(Error),
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("restartService", () => {
    it("restarts a service via API", async () => {
      await restartService("svc-1");

      expect(client.post).toHaveBeenCalledWith(
        "/xrpc/io.pocketenv.service.restartService",
        undefined,
        expect.objectContaining({ params: { serviceId: "svc-1" } }),
      );
    });

    it("logs error and exits when restart fails", async () => {
      vi.mocked(client.post).mockRejectedValue(new Error("API error"));

      await restartService("svc-1");

      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to restart service"),
        expect.any(Error),
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("startService", () => {
    it("starts a service via API", async () => {
      await startService("svc-1");

      expect(client.post).toHaveBeenCalledWith(
        "/xrpc/io.pocketenv.service.startService",
        undefined,
        expect.objectContaining({ params: { serviceId: "svc-1" } }),
      );
    });

    it("logs error and exits when start fails", async () => {
      vi.mocked(client.post).mockRejectedValue(new Error("API error"));

      await startService("svc-1");

      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to start service"),
        expect.any(Error),
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("stopService", () => {
    it("stops a service via API", async () => {
      await stopService("svc-1");

      expect(client.post).toHaveBeenCalledWith(
        "/xrpc/io.pocketenv.service.stopService",
        undefined,
        expect.objectContaining({ params: { serviceId: "svc-1" } }),
      );
    });

    it("logs error and exits when stop fails", async () => {
      vi.mocked(client.post).mockRejectedValue(new Error("API error"));

      await stopService("svc-1");

      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to stop service"),
        expect.any(Error),
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("deleteService", () => {
    it("deletes a service via API and logs success", async () => {
      await deleteService("svc-1");

      expect(client.post).toHaveBeenCalledWith(
        "/xrpc/io.pocketenv.service.deleteService",
        undefined,
        expect.objectContaining({ params: { serviceId: "svc-1" } }),
      );
      expect(consola.success).toHaveBeenCalledWith(
        expect.stringContaining("svc-1"),
      );
    });

    it("logs error and exits when deletion fails", async () => {
      vi.mocked(client.post).mockRejectedValue(new Error("API error"));

      await deleteService("svc-1");

      expect(consola.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to delete service"),
        expect.any(Error),
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});
