import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/env", () => ({
  env: {
    JWT_SECRET: "test-jwt-secret",
  },
}));

const { default: generateJwt } = await import("../../lib/generateJwt");

describe("generateJwt", () => {
  it("returns a non-empty JWT string", async () => {
    const token = await generateJwt("did:plc:testuser");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("returns a well-formed JWT (three dot-separated parts)", async () => {
    const token = await generateJwt("did:plc:testuser");
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
  });

  it("encodes the provided DID as the sub claim", async () => {
    const did = "did:plc:abc123";
    const token = await generateJwt(did);

    // Decode the payload (second segment) without verification
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1]!, "base64url").toString("utf-8"),
    );

    expect(payload.sub).toBe(did);
  });

  it("produces different tokens for different DIDs", async () => {
    const token1 = await generateJwt("did:plc:user1");
    const token2 = await generateJwt("did:plc:user2");
    expect(token1).not.toBe(token2);
  });
});
