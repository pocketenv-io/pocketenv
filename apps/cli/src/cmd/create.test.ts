import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import createSandbox from "./create";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("../lib/expandRepo", () => ({
  expandRepo: vi.fn((repo: string) => `https://github.com/${repo}`),
}));
vi.mock("../lib/sodium", () => ({
  default: vi.fn().mockResolvedValue("encrypted-token"),
}));
vi.mock("../lib/redact", () => ({
  default: vi.fn((val: string) => val),
}));
vi.mock("./ssh", () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../theme", () => ({
  c: {
    primary: (s: string | number) => String(s),
  },
}));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn(), create: vi.fn() },
}));

describe("createSandbox", () => {
  const mockExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined as never);

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SPRITE_TOKEN;
    delete process.env.DAYTONA_API_KEY;
    delete process.env.DAYTONA_ORGANIZATION_ID;
    delete process.env.DENO_DEPLOY_TOKEN;
    delete process.env.VERCEL_API_TOKEN;
    delete process.env.VERCEL_PROJECT_ID;
    delete process.env.VERCEL_TEAM_ID;
  });

  it("creates a sandbox with default provider and logs success", async () => {
    vi.mocked(Sandbox.create).mockResolvedValue({
      data: { name: "my-sandbox" },
    } as any);

    await createSandbox("my-sandbox", {});

    expect(Sandbox.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "my-sandbox" }),
    );
    expect(consola.success).toHaveBeenCalledWith(
      expect.stringContaining("my-sandbox"),
    );
  });

  it("exits with error for unsupported provider", async () => {
    await createSandbox("my-sandbox", { provider: "unsupported" });

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining("Unsupported provider"),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("exits with error when SPRITE_TOKEN is missing for sprites provider", async () => {
    await createSandbox("my-sandbox", { provider: "sprites" });

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining("SPRITE_TOKEN"),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("creates sandbox with sprites provider when token is set", async () => {
    process.env.SPRITE_TOKEN = "test-sprite-token";
    vi.mocked(Sandbox.create).mockResolvedValue({
      data: { name: "my-sandbox" },
    } as any);

    await createSandbox("my-sandbox", { provider: "sprites" });

    expect(Sandbox.create).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "sprites",
        providerOptions: expect.objectContaining({
          spriteToken: "encrypted-token",
        }),
      }),
    );
    expect(consola.success).toHaveBeenCalledOnce();
  });

  it("exits with error when DAYTONA vars are missing", async () => {
    await createSandbox("my-sandbox", { provider: "daytona" });

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining("DAYTONA_API_KEY"),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("exits with error when DENO_DEPLOY_TOKEN is missing", async () => {
    await createSandbox("my-sandbox", { provider: "deno" });

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining("DENO_DEPLOY_TOKEN"),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("exits with error when VERCEL vars are missing", async () => {
    await createSandbox("my-sandbox", { provider: "vercel" });

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining("VERCEL_API_TOKEN"),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("expands repo shorthand when provided", async () => {
    const { expandRepo } = await import("../lib/expandRepo");
    vi.mocked(Sandbox.create).mockResolvedValue({
      data: { name: "my-sandbox" },
    } as any);

    await createSandbox("my-sandbox", { repo: "owner/repo" });

    expect(expandRepo).toHaveBeenCalledWith("owner/repo");
    expect(Sandbox.create).toHaveBeenCalledWith(
      expect.objectContaining({
        repo: "https://github.com/owner/repo",
      }),
    );
  });

  it("connects via SSH after creation when ssh option is set", async () => {
    const connectToSandbox = (await import("./ssh")).default;
    vi.mocked(Sandbox.create).mockResolvedValue({
      data: { name: "my-sandbox" },
      waitUntilRunning: vi.fn().mockResolvedValue(undefined),
    } as any);

    await createSandbox("my-sandbox", { ssh: true });

    expect(connectToSandbox).toHaveBeenCalledWith("my-sandbox");
  });

  it("logs error when sandbox creation throws", async () => {
    vi.mocked(Sandbox.create).mockRejectedValue(new Error("API error"));

    await createSandbox("my-sandbox", {});

    expect(consola.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to create sandbox"),
    );
  });
});
