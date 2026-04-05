import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import { listPorts } from "./ports";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("../theme", () => ({
  c: {
    primary: (s: string | number) => String(s),
    secondary: (s: string | number) => String(s),
    link: (s: string | number) => String(s),
  },
}));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn() },
}));

describe("listPorts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists ports and logs a table", async () => {
    const mockSandbox = {
      ports: {
        list: vi.fn().mockResolvedValue([
          { port: 3000, description: "Web server", previewUrl: "https://preview.example.com" },
          { port: 8080, description: null, previewUrl: null },
        ]),
      },
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await listPorts("my-sandbox");

    expect(Sandbox.get).toHaveBeenCalledWith("my-sandbox");
    expect(mockSandbox.ports.list).toHaveBeenCalledOnce();
    expect(consola.log).toHaveBeenCalledOnce();
  });

  it("logs an empty table when no ports are exposed", async () => {
    const mockSandbox = {
      ports: { list: vi.fn().mockResolvedValue([]) },
    };
    vi.mocked(Sandbox.get).mockResolvedValue(mockSandbox as any);

    await listPorts("my-sandbox");

    expect(consola.log).toHaveBeenCalledOnce();
  });
});
