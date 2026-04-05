import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/env", () => ({
  env: {
    CF_SECRET_KEY: "test-secret-key",
  },
}));

// Import after mock is set up
const { default: validateTurnstile } = await import("../../lib/turnstile");

describe("validateTurnstile", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the Cloudflare siteverify endpoint", async () => {
    await validateTurnstile("token123", "1.2.3.4");

    expect(fetch).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("sends the secret, token, and remoteip in the request body", async () => {
    await validateTurnstile("my-token", "10.0.0.1");

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(init.body);

    expect(body).toEqual({
      secret: "test-secret-key",
      response: "my-token",
      remoteip: "10.0.0.1",
    });
  });

  it("returns the parsed JSON response on success", async () => {
    const result = await validateTurnstile("token", "0.0.0.0");
    expect(result).toEqual({ success: true });
  });

  it("returns a failure object when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const result = await validateTurnstile("token", "0.0.0.0");
    expect(result).toEqual({
      success: false,
      "error-codes": ["internal-error"],
    });
  });
});
