import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import ps from "./ps";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("../theme", () => ({
  c: {
    primary: (s: string | number) => String(s),
    secondary: (s: string | number) => String(s),
    highlight: (s: string | number) => String(s),
  },
}));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), list: vi.fn(), configure: vi.fn() },
}));

describe("ps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists only running sandboxes", async () => {
    vi.mocked(Sandbox.list).mockResolvedValue({
      sandboxes: [
        {
          name: "running-sandbox",
          baseSandbox: "base",
          status: "RUNNING",
          startedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
    } as any);

    await ps();

    expect(Sandbox.list).toHaveBeenCalledWith({
      limit: 100,
      offset: 0,
      isRunning: true,
    });
    expect(consola.log).toHaveBeenCalledOnce();
  });

  it("logs an empty table when no running sandboxes", async () => {
    vi.mocked(Sandbox.list).mockResolvedValue({ sandboxes: [] } as any);

    await ps();

    expect(consola.log).toHaveBeenCalledOnce();
  });
});
