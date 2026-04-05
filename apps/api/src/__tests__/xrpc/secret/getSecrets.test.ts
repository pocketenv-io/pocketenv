import { XRPCError } from "@atproto/xrpc-server";
import { describe, expect, it } from "vitest";
import registerGetSecrets from "../../../xrpc/io/pocketenv/secret/getSecrets";
import {
  MOCK_SECRET,
  authNoCredentials,
  authWithDid,
  captureSecretHandler,
  mockDb,
} from "../helpers";

function makeHandler(...dbResults: unknown[]) {
  const ctx = { authVerifier: () => {}, db: mockDb(...dbResults) };
  return captureSecretHandler("getSecrets", registerGetSecrets, ctx);
}

describe("getSecrets handler", () => {
  it("throws XRPCError 401 when auth has no credentials", async () => {
    const handler = makeHandler();

    await expect(
      handler({ params: {}, auth: authNoCredentials }),
    ).rejects.toBeInstanceOf(XRPCError);

    await expect(
      handler({ params: {}, auth: authNoCredentials }),
    ).rejects.toMatchObject({ type: 401 });
  });

  it("returns secrets mapped to the output schema", async () => {
    const rows = [{ secrets: MOCK_SECRET }];
    const handler = makeHandler(rows, [{ count: 1 }]);

    const { body } = await handler({
      params: {},
      auth: authWithDid(),
    });

    expect(body.total).toBe(1);
    expect(body.secrets).toHaveLength(1);
    expect(body.secrets[0]).toEqual({
      id: MOCK_SECRET.id,
      name: MOCK_SECRET.name,
      createdAt: MOCK_SECRET.createdAt.toISOString(),
    });
  });

  it("omits the secret value from the output (never exposed)", async () => {
    const handler = makeHandler([{ secrets: MOCK_SECRET }], [{ count: 1 }]);

    const { body } = await handler({ params: {}, auth: authWithDid() });

    expect(body.secrets[0]).not.toHaveProperty("value");
  });

  it("returns an empty list when the user has no secrets", async () => {
    const handler = makeHandler([], [{ count: 0 }]);

    const { body } = await handler({ params: {}, auth: authWithDid() });

    expect(body.secrets).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("rejects on db error (retrieve catch re-throws as a defect, bypassing catchAll)", async () => {
    const db = {
      select: () => db,
      from: () => db,
      leftJoin: () => db,
      where: () => db,
      limit: () => db,
      offset: () => db,
      execute: () => Promise.reject(new Error("db error")),
    };
    const ctx = { authVerifier: () => {}, db };
    const handler = captureSecretHandler("getSecrets", registerGetSecrets, ctx);

    await expect(
      handler({ params: {}, auth: authWithDid() }),
    ).rejects.toThrow();
  });
});
