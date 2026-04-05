import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import { Sandbox } from "@pocketenv/sdk";
import whoami from "./whoami";

vi.mock("../lib/sdk", () => ({ configureSdk: vi.fn() }));
vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("@pocketenv/sdk", () => ({
  Sandbox: { get: vi.fn(), configure: vi.fn(), getProfile: vi.fn() },
}));

describe("whoami", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs the current user profile", async () => {
    vi.mocked(Sandbox.getProfile).mockResolvedValue({
      handle: "testuser.bsky.social",
      displayName: "Test User",
    } as any);

    await whoami();

    expect(Sandbox.getProfile).toHaveBeenCalledOnce();
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining("@testuser.bsky.social"),
    );
    expect(consola.log).toHaveBeenCalledWith(
      expect.stringContaining("Test User"),
    );
  });
});
