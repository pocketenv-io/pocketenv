import { describe, expect, it } from "vitest";
import registerGetSandbox from "../../../xrpc/io/pocketenv/sandbox/getSandbox";
import {
  MOCK_SANDBOX,
  MOCK_USER,
  authNoCredentials,
  captureSandboxHandler,
  mockDb,
} from "../helpers";

function makeHandler(dbResults: unknown[]) {
  const ctx = { authVerifier: () => {}, db: mockDb(...dbResults) };
  return captureSandboxHandler("getSandbox", registerGetSandbox, ctx);
}

describe("getSandbox handler", () => {
  it("returns the sandbox mapped to the output schema", async () => {
    const dbRow = { sandboxes: MOCK_SANDBOX, users: null };
    const handler = makeHandler([[dbRow]]);

    const { body } = await handler({
      params: { id: MOCK_SANDBOX.id },
      auth: authNoCredentials,
    });

    expect(body.sandbox).toMatchObject({
      id: MOCK_SANDBOX.id,
      name: MOCK_SANDBOX.name,
      provider: MOCK_SANDBOX.provider,
      displayName: MOCK_SANDBOX.displayName,
      description: MOCK_SANDBOX.description,
      status: MOCK_SANDBOX.status,
      installs: MOCK_SANDBOX.installs,
      uri: MOCK_SANDBOX.uri,
      vcpus: MOCK_SANDBOX.vcpus,
      memory: MOCK_SANDBOX.memory,
      disk: MOCK_SANDBOX.disk,
      createdAt: MOCK_SANDBOX.createdAt.toISOString(),
      startedAt: MOCK_SANDBOX.startedAt!.toISOString(),
    });
  });

  it("includes owner when a user row is joined", async () => {
    const dbRow = { sandboxes: MOCK_SANDBOX, users: MOCK_USER };
    const handler = makeHandler([[dbRow]]);

    const { body } = await handler({
      params: { id: MOCK_SANDBOX.id },
      auth: authNoCredentials,
    });

    expect(body.sandbox?.owner).toMatchObject({
      id: MOCK_USER.id,
      did: MOCK_USER.did,
      handle: MOCK_USER.handle,
      createdAt: MOCK_USER.createdAt.toISOString(),
      updatedAt: MOCK_USER.updatedAt.toISOString(),
    });
  });

  it("returns sandbox: undefined when no row is found", async () => {
    // empty array → destructure as undefined
    const handler = makeHandler([[undefined]]);

    const { body } = await handler({
      params: { id: "nonexistent" },
      auth: authNoCredentials,
    });

    expect(body.sandbox).toBeUndefined();
  });

  it("returns sandbox: null when the db throws (Effect.catchAll)", async () => {
    // Reject the execute() call to trigger the catchAll
    const db = {
      select: () => db,
      from: () => db,
      leftJoin: () => db,
      where: () => db,
      execute: () => Promise.reject(new Error("db down")),
    };
    const ctx = { authVerifier: () => {}, db };
    const handler = captureSandboxHandler("getSandbox", registerGetSandbox, ctx);

    const { body } = await handler({
      params: { id: "sb-1" },
      auth: authNoCredentials,
    });

    expect(body.sandbox).toBeNull();
  });

  it("maps baseSandbox from the base column", async () => {
    const sandboxWithBase = { ...MOCK_SANDBOX, base: "at://some/base/ref" };
    const handler = makeHandler([[{ sandboxes: sandboxWithBase, users: null }]]);

    const { body } = await handler({
      params: { id: sandboxWithBase.id },
      auth: authNoCredentials,
    });

    expect(body.sandbox?.baseSandbox).toBe("at://some/base/ref");
  });

  it("omits startedAt when it is null", async () => {
    const sandboxNoStart = { ...MOCK_SANDBOX, startedAt: null };
    const handler = makeHandler([[{ sandboxes: sandboxNoStart, users: null }]]);

    const { body } = await handler({
      params: { id: sandboxNoStart.id },
      auth: authNoCredentials,
    });

    expect(body.sandbox?.startedAt).toBeUndefined();
  });
});
