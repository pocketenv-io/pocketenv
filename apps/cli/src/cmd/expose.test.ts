import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { exposePort } from "./expose";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("../theme", () => ({
  c: {
    primary: (s: string | number) => String(s),
    secondary: (s: string | number) => String(s),
  },
}));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn() },
}));

describe("exposePort", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes a port and logs success with preview URL", async () => {
    const mockSandbox = {
      expose: vi
        .fn()
        .mockResolvedValue({ previewUrl: "https://preview.example.com" }),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await exposePort("my-sandbox", 3000, "My app");

    expect(Sandbox.get).toHaveBeenCalledWith("my-sandbox");
    expect(mockSandbox.expose).toHaveBeenCalledWith(3000, "My app");
    expect(consola.success).toHaveBeenCalledTimes(2);
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining("3000"),
    );
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining("https://preview.example.com"),
    );
  });

  it("exposes a port without preview URL", async () => {
    const mockSandbox = {
      expose: vi.fn().mockResolvedValue({ previewUrl: null }),
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await exposePort("my-sandbox", 8080);

    expect(consola.success).toHaveBeenCalledOnce();
  });

  it("logs error and exits on failure", async () => {
    vi.mocked(Sandbox.get).mockRejectedValue(new Error("API error"));

    await exposePort("my-sandbox", 3000);

    expect(consola.error).toHaveBeenCalledWith(
      "Failed to expose port:",
      expect.any(Error),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
