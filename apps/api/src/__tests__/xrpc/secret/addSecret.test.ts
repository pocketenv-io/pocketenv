import { XRPCError } from "@atproto/xrpc-server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("lib/agent", () => ({ createAgent: vi.fn() }));
vi.mock("atproto/sandbox", () => ({ updateSandbox: vi.fn() }));

const { default: registerAddSecret } = await import(
  "../../../xrpc/io/pocketenv/secret/addSecret"
);
const { createAgent } = await import("lib/agent");
const { updateSandbox } = await import("atproto/sandbox");

import {
  MOCK_SECRET,
  authNoCredentials,
  authWithDid,
  captureSecretHandler,
  mockDb,
} from "../helpers";

const INSERTED_SECRET = { ...MOCK_SECRET };
const INSERTED_SANDBOX_SECRET = {
  id: "ss-1",
  secretId: "secret-1",
  sandboxId: "sb-abc123",
  name: "MY_API_KEY",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeHandler(...dbResults: unknown[]) {
  const ctx = {
    authVerifier: () => {},
    db: mockDb(...dbResults),
    oauthClient: {},
  };
  return captureSecretHandler("addSecret", registerAddSecret, ctx);
}

describe("addSecret handler", () => {
  beforeEach(() => {
    vi.mocked(createAgent).mockReset();
    vi.mocked(updateSandbox).mockReset();
  });

  it("throws XRPCError 401 when there are no credentials", async () => {
    const handler = makeHandler();

    await expect(
      handler({
        input: { body: { secret: { name: "KEY", value: "val" } } },
        auth: authNoCredentials,
      }),
    ).rejects.toBeInstanceOf(XRPCError);

    await expect(
      handler({
        input: { body: { secret: { name: "KEY", value: "val" } } },
        auth: authNoCredentials,
      }),
    ).rejects.toMatchObject({ type: 401 });
  });

  it("inserts the secret and returns an empty body when no sandboxId", async () => {
    // Transaction: first execute() = insert secret result
    const handler = makeHandler([INSERTED_SECRET]);

    const result = await handler({
      input: { body: { secret: { name: "MY_KEY", value: "my-value" } } },
      auth: authWithDid(),
    });

    // Handler returns undefined body for void procedures
    expect(result).toBeUndefined();
    expect(createAgent).not.toHaveBeenCalled();
  });

  it("inserts the secret and links it to a sandbox when sandboxId is provided", async () => {
    vi.mocked(createAgent).mockResolvedValue({ assertDid: "did:plc:x" } as any);
    vi.mocked(updateSandbox).mockResolvedValue(undefined);

    const handler = makeHandler(
      // tx.insert(secrets).returning().execute()
      [INSERTED_SECRET],
      // tx.insert(sandboxSecrets).returning().execute()
      [INSERTED_SANDBOX_SECRET],
      // post-tx select for updateSandbox
      [{ sandbox_secrets: INSERTED_SANDBOX_SECRET, sandboxes: { uri: "at://did/io.pocketenv.sandbox/tid1" } }],
    );

    await handler({
      input: {
        body: {
          secret: { name: "MY_KEY", value: "my-value", sandboxId: "sb-abc123" },
        },
      },
      auth: authWithDid(),
    });

    expect(createAgent).toHaveBeenCalledWith(
      expect.anything(),
      "did:plc:testuser",
    );
  });

  it("throws XRPCError 500 when createAgent returns null", async () => {
    vi.mocked(createAgent).mockResolvedValue(null);

    const handler = makeHandler([INSERTED_SECRET], [INSERTED_SANDBOX_SECRET]);

    await expect(
      handler({
        input: {
          body: {
            secret: {
              name: "MY_KEY",
              value: "my-value",
              sandboxId: "sb-abc123",
            },
          },
        },
        auth: authWithDid(),
      }),
    ).rejects.toMatchObject({ type: 500 });
  });
});
