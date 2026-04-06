import { describe, expect, it } from "vitest";
import registerGetSandboxes from "../../../xrpc/io/pocketenv/sandbox/getSandboxes";
import {
  MOCK_SANDBOX,
  authNoCredentials,
  captureSandboxHandler,
  mockDb,
} from "../helpers";

function makeHandler(...dbResults: unknown[]) {
  const ctx = { authVerifier: () => {}, db: mockDb(...dbResults) };
  return captureSandboxHandler("getSandboxes", registerGetSandboxes, ctx);
}

describe("getSandboxes handler", () => {
  it("returns a mapped list of sandboxes and the total count", async () => {
    // First execute() → rows; second execute() → count
    const handler = makeHandler([{ sandboxes: MOCK_SANDBOX }], [{ count: 1 }]);

    const { body } = await handler({
      params: {},
      auth: authNoCredentials,
    });

    expect(body.total).toBe(1);
    expect(body.sandboxes).toHaveLength(1);
    expect(body.sandboxes[0]).toMatchObject({
      id: MOCK_SANDBOX.id,
      name: MOCK_SANDBOX.name,
      displayName: MOCK_SANDBOX.displayName,
      installs: MOCK_SANDBOX.installs,
      uri: MOCK_SANDBOX.uri,
      createdAt: MOCK_SANDBOX.createdAt.toISOString(),
    });
  });

  it("returns an empty list when there are no sandboxes", async () => {
    const handler = makeHandler([], [{ count: 0 }]);

    const { body } = await handler({
      params: {},
      auth: authNoCredentials,
    });

    expect(body.sandboxes).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("maps multiple sandboxes correctly", async () => {
    const second = {
      ...MOCK_SANDBOX,
      id: "sb-xyz",
      name: "second-sandbox",
      createdAt: new Date("2024-02-01T00:00:00Z"),
    };
    const handler = makeHandler(
      [{ sandboxes: MOCK_SANDBOX }, { sandboxes: second }],
      [{ count: 2 }],
    );

    const { body } = await handler({ params: {}, auth: authNoCredentials });

    expect(body.sandboxes).toHaveLength(2);
    expect(body.sandboxes[1]?.id).toBe("sb-xyz");
    expect(body.total).toBe(2);
  });

  it("returns sandboxes: [] on db error (Effect.catchAll)", async () => {
    const db = {
      select: () => db,
      from: () => db,
      leftJoin: () => db,
      where: () => db,
      orderBy: () => db,
      limit: () => db,
      offset: () => db,
      execute: () => Promise.reject(new Error("db unavailable")),
    };
    const ctx = { authVerifier: () => {}, db };
    const handler = captureSandboxHandler(
      "getSandboxes",
      registerGetSandboxes,
      ctx,
    );

    const { body } = await handler({ params: {}, auth: authNoCredentials });

    expect(body.sandboxes).toEqual([]);
  });

  it("defaults count to 0 when the count row is missing", async () => {
    const handler = makeHandler([{ sandboxes: MOCK_SANDBOX }], [{}]);

    const { body } = await handler({ params: {}, auth: authNoCredentials });

    expect(body.total).toBe(0);
  });
});
