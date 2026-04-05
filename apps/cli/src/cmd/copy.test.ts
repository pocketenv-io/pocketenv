import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import copy from "./copy";

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
vi.mock("ora", () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn(),
    stopAndPersist: vi.fn(),
  })),
}));

describe("copy", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("copies from local to sandbox", async () => {
    const mockSandbox = {
      data: { status: "RUNNING" },
      copy: { upload: vi.fn().mockResolvedValue(undefined) },
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await copy("./local/file.txt", "my-sandbox:/remote/file.txt");

    expect(Sandbox.get).toHaveBeenCalledWith("my-sandbox");
    expect(mockSandbox.copy.upload).toHaveBeenCalledWith(
      "./local/file.txt",
      "/remote/file.txt",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("copies from sandbox to local", async () => {
    const mockSandbox = {
      data: { status: "RUNNING" },
      copy: { download: vi.fn().mockResolvedValue(undefined) },
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await copy("my-sandbox:/remote/file.txt", "./local/file.txt");

    expect(mockSandbox.copy.download).toHaveBeenCalledWith(
      "/remote/file.txt",
      "./local/file.txt",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("copies between two sandboxes", async () => {
    const mockSourceSandbox = {
      data: { status: "RUNNING" },
      copy: { to: vi.fn().mockResolvedValue(undefined) },
    };
    const mockDestSandbox = { data: { status: "RUNNING" } };
    vi.mocked(Sandbox.get)
      .mockResolvedValueOnce(mockSourceSandbox as any)
      .mockResolvedValueOnce(mockDestSandbox as any);

    await copy("src-sandbox:/src/file.txt", "dst-sandbox:/dst/file.txt");

    expect(mockSourceSandbox.copy.to).toHaveBeenCalledWith(
      "dst-sandbox",
      "/src/file.txt",
      "/dst/file.txt",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("exits with error when source and destination are both local", async () => {
    await copy("./local/src.txt", "./local/dst.txt");

    expect(consola.error).toHaveBeenCalledWith(
      "Both source and destination cannot be local paths.",
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("exits with error when source equals destination", async () => {
    await copy("same-path", "same-path");

    expect(consola.error).toHaveBeenCalledWith(
      "Source and destination cannot be the same.",
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("exits with error when sandbox is not running", async () => {
    const mockSandbox = {
      data: { status: "STOPPED" },
      copy: { upload: vi.fn() },
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await copy("./local/file.txt", "my-sandbox:/remote/file.txt");

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining("not running"),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
