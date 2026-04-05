import { vi, describe, it, expect, beforeEach } from "vitest";
import consola from "consola";
import logout from "./logout";

vi.mock("consola", () => ({
  default: { log: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
vi.mock("node:fs/promises", () => ({
  default: {
    access: vi.fn(),
    unlink: vi.fn(),
  },
}));

import fs from "node:fs/promises";

describe("logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the token file and logs success", async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.unlink).mockResolvedValue(undefined);

    await logout();

    expect(fs.unlink).toHaveBeenCalledOnce();
    expect(consola.log).toHaveBeenCalledWith("Logged out successfully");
  });

  it("logs success even if token file does not exist", async () => {
    vi.mocked(fs.access).mockRejectedValue(
      Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
    );

    await logout();

    expect(fs.unlink).not.toHaveBeenCalled();
    expect(consola.log).toHaveBeenCalledWith("Logged out successfully");
  });
});
