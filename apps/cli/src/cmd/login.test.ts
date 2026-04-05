import { vi, describe, it, expect, beforeEach } from "vitest";
import login from "./login";

vi.mock("../client", () => ({
  client: { post: vi.fn() },
}));
vi.mock("open", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("node:fs/promises", () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

import { client } from "../client";
import open from "open";

describe("login", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    consoleLogSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);
  });

  it("logs an error and closes server when redirect URL lacks authorize", async () => {
    vi.mocked(client.post).mockResolvedValue({
      data: "https://example.com/callback",
    });

    await login("test.bsky.social");

    expect(client.post).toHaveBeenCalledWith("/login", {
      handle: "test.bsky.social",
      cli: true,
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to login, please check your handle and try again.",
    );
    expect(open).not.toHaveBeenCalled();
  });

  it("opens the browser when redirect URL contains authorize", async () => {
    vi.mocked(client.post).mockResolvedValue({
      data: "https://bsky.app/oauth/authorize?request_uri=abc",
    });

    await login("test.bsky.social");

    expect(open).toHaveBeenCalledWith(
      "https://bsky.app/oauth/authorize?request_uri=abc",
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("https://bsky.app/oauth/authorize"),
    );
  });
});
