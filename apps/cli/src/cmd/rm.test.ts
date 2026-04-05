import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import deleteSandbox from "./rm";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn() },
}));

describe("deleteSandbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a sandbox and logs success", async () => {
    const mockSandbox = { delete: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await deleteSandbox("my-sandbox");

    expect(Sandbox.get).toHaveBeenCalledWith("my-sandbox");
    expect(mockSandbox.delete).toHaveBeenCalledOnce();
    expect(consola.success).toHaveBeenCalledWith("Sandbox deleted successfully");
  });

  it("logs an error when deletion fails", async () => {
    vi.mocked(Sandbox.get).mockRejectedValue(new Error("Not found"));

    await deleteSandbox("my-sandbox");

    expect(consola.error).toHaveBeenCalledWith("Failed to delete sandbox");
  });

  it("logs an error when delete() throws", async () => {
    const mockSandbox = {
      delete: vi.fn().mockRejectedValue(new Error("Delete failed")),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await deleteSandbox("my-sandbox");

    expect(consola.error).toHaveBeenCalledWith("Failed to delete sandbox");
  });
});
