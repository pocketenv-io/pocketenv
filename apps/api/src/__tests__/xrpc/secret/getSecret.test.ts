import { XRPCError } from "@atproto/xrpc-server";
import { describe, expect, it } from "vitest";
import registerGetSecret from "../../../xrpc/io/pocketenv/secret/getSecret";
import {
  MOCK_SECRET,
  authNoCredentials,
  authWithDid,
  captureSecretHandler,
  mockDb,
} from "../helpers";

function makeHandler(...dbResults: unknown[]) {
  const ctx = { authVerifier: () => {}, db: mockDb(...dbResults) };
  return captureSecretHandler("getSecret", registerGetSecret, ctx);
}

describe("getSecret handler", () => {
  it("throws XRPCError 401 when there are no credentials", async () => {
    const handler = makeHandler();

    await expect(
      handler({ params: { id: "s-1" }, auth: authNoCredentials }),
    ).rejects.toBeInstanceOf(XRPCError);

    await expect(
      handler({ params: { id: "s-1" }, auth: authNoCredentials }),
    ).rejects.toMatchObject({ type: 401 });
  });

  it("returns the secret mapped to the output schema", async () => {
    const handler = makeHandler([{ secrets: MOCK_SECRET }]);

    const { body } = await handler({
      params: { id: MOCK_SECRET.id },
      auth: authWithDid(),
    });

    expect(body.secret).toEqual({
      id: MOCK_SECRET.id,
      name: MOCK_SECRET.name,
      createdAt: MOCK_SECRET.createdAt.toISOString(),
    });
  });

  it("does not expose the secret value", async () => {
    const handler = makeHandler([{ secrets: MOCK_SECRET }]);

    const { body } = await handler({
      params: { id: MOCK_SECRET.id },
      auth: authWithDid(),
    });

    expect(body.secret).not.toHaveProperty("value");
  });

  it("returns secret: undefined when no matching row is found", async () => {
    const handler = makeHandler([]);

    const { body } = await handler({
      params: { id: "nonexistent" },
      auth: authWithDid(),
    });

    expect(body.secret).toBeUndefined();
  });
});
