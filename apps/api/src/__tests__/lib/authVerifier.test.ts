import type { Request } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/env", () => ({
  env: {
    JWT_SECRET: "test-secret",
  },
}));

vi.mock("../../lib/turnstile", () => ({
  default: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

const { default: authVerifier } = await import("../../lib/authVerfifier");
const { default: validateTurnstile } = await import("../../lib/turnstile");
const jwt = await import("jsonwebtoken");

function makeReq(
  overrides: Partial<Request["headers"]> = {},
  authorization?: string,
): { req: Partial<Request> } {
  return {
    req: {
      headers: {
        ...overrides,
        ...(authorization !== undefined ? { authorization } : {}),
      },
    } as unknown as Request,
  };
}

describe("authVerifier", () => {
  beforeEach(() => {
    vi.mocked(validateTurnstile).mockReset();
    vi.mocked(jwt.default.verify).mockReset();
  });

  it("returns empty artifacts when no challenge and no authorization", async () => {
    const result = await authVerifier(makeReq());
    expect(result).toEqual({ artifacts: false });
  });

  it("validates turnstile when x-challenge header is present", async () => {
    vi.mocked(validateTurnstile).mockResolvedValue({ success: true });

    const result = await authVerifier(
      makeReq({ "x-challenge": "token", "cf-connecting-ip": "1.2.3.4" }),
    );

    expect(validateTurnstile).toHaveBeenCalledWith("token", "1.2.3.4");
    expect(result.artifacts).toBe(true);
  });

  it("falls back to x-forwarded-for when cf-connecting-ip is absent", async () => {
    vi.mocked(validateTurnstile).mockResolvedValue({ success: true });

    await authVerifier(
      makeReq({ "x-challenge": "token", "x-forwarded-for": "5.6.7.8" }),
    );

    expect(validateTurnstile).toHaveBeenCalledWith("token", "5.6.7.8");
  });

  it("uses 'unknown' as ip when no ip header is present", async () => {
    vi.mocked(validateTurnstile).mockResolvedValue({ success: false });

    await authVerifier(makeReq({ "x-challenge": "token" }));

    expect(validateTurnstile).toHaveBeenCalledWith("token", "unknown");
  });

  it("sets artifacts to false when turnstile validation fails", async () => {
    vi.mocked(validateTurnstile).mockResolvedValue({ success: false });

    const result = await authVerifier(
      makeReq({ "x-challenge": "token", "cf-connecting-ip": "1.1.1.1" }),
    );

    expect(result.artifacts).toBe(false);
  });

  it("extracts credentials from a valid bearer token", async () => {
    const fakeCredentials = { sub: "did:plc:abc", iat: 123 };
    vi.mocked(jwt.default.verify).mockReturnValue(fakeCredentials as never);

    const result = await authVerifier(makeReq({}, "Bearer valid-token"));

    expect(jwt.default.verify).toHaveBeenCalledWith(
      "valid-token",
      "test-secret",
      { ignoreExpiration: true },
    );
    expect(result.credentials).toEqual(fakeCredentials);
  });

  it("returns no credentials when authorization header is absent", async () => {
    const result = await authVerifier(makeReq());
    expect(result.credentials).toBeUndefined();
  });

  it("returns no credentials when bearer token is the string 'null'", async () => {
    const result = await authVerifier(makeReq({}, "Bearer null"));
    expect(result.credentials).toBeUndefined();
    expect(jwt.default.verify).not.toHaveBeenCalled();
  });
});
