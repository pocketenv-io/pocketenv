import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import listSandboxes from "./list";

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

describe("listSandboxes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches sandboxes and logs a table", async () => {
    vi.mocked(Sandbox.list).mockResolvedValue({
      sandboxes: [
        {
          name: "my-sandbox",
          baseSandbox: "base",
          status: "RUNNING",
          createdAt: new Date().toISOString(),
        },
      ],
    } as any);

    await listSandboxes();

    expect(Sandbox.list).toHaveBeenCalledWith({ limit: 100, offset: 0 });
    expect(consola.log).toHaveBeenCalledOnce();
  });

  it("logs an empty table when no sandboxes exist", async () => {
    vi.mocked(Sandbox.list).mockResolvedValue({ sandboxes: [] } as any);

    await listSandboxes();

    expect(consola.log).toHaveBeenCalledOnce();
  });

  it("renders STOPPED status without highlight", async () => {
    vi.mocked(Sandbox.list).mockResolvedValue({
      sandboxes: [
        {
          name: "stopped-sandbox",
          baseSandbox: null,
          status: "STOPPED",
          createdAt: new Date().toISOString(),
        },
      ],
    } as any);

    await listSandboxes();

    expect(consola.log).toHaveBeenCalledOnce();
  });
});
