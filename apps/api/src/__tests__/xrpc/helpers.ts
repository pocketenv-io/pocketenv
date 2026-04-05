/**
 * Shared test helpers for xrpc handler tests.
 */

/**
 * Creates a chainable Drizzle-like mock db.
 *
 * Every method call returns a new proxy so you can chain any sequence of
 * `.select().from().where().execute()` etc.  Each call to `.execute()`
 * consumes the next entry from `results` in order.
 *
 * Special handling:
 *   • `.transaction(fn)` – invokes `fn` with a fresh chain (same counter)
 *   • `.then` / `.catch` / `.finally` – undefined (prevents accidental
 *     Promise coercion of the chain itself)
 */
export function mockDb(...results: unknown[]) {
  let idx = 0;

  function chain(): any {
    return new Proxy(
      {},
      {
        get(_t, key: string | symbol) {
          if (key === "execute") return () => Promise.resolve(results[idx++]);
          if (key === "transaction") return (fn: (tx: any) => any) => fn(chain());
          if (
            key === "then" ||
            key === "catch" ||
            key === "finally" ||
            key === Symbol.toPrimitive ||
            key === Symbol.iterator
          )
            return undefined;
          return (..._args: any[]) => chain();
        },
      },
    );
  }

  return chain();
}

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

export const MOCK_SANDBOX = {
  id: "sb-abc123",
  name: "test-sandbox",
  provider: "cloudflare",
  displayName: "Test Sandbox",
  description: "A sandbox for testing",
  topics: ["testing"],
  base: null as string | null,
  status: "running",
  repo: "https://github.com/test/repo",
  logo: null as string | null,
  readme: "# Test",
  installs: 42,
  uri: "at://did:plc:xyz/io.pocketenv.sandbox/tid1",
  sandboxId: null as string | null,
  publicKey: "pk-abc",
  userId: "user-1",
  instanceType: null as string | null,
  vcpus: 2,
  memory: 4,
  disk: 10,
  keepAlive: false,
  sleepAfter: null as string | null,
  cid: null as string | null,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  startedAt: new Date("2024-01-02T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

export const MOCK_USER = {
  id: "user-1",
  did: "did:plc:testuser",
  displayName: "Test User",
  handle: "testuser.bsky.social",
  avatar: "https://cdn.bsky.app/img/avatar.jpg",
  createdAt: new Date("2023-01-01T00:00:00Z"),
  updatedAt: new Date("2023-06-01T00:00:00Z"),
};

export const MOCK_SECRET = {
  id: "secret-1",
  name: "MY_API_KEY",
  value: "encrypted-value",
  redacted: true,
  createdAt: new Date("2024-03-01T00:00:00Z"),
  updatedAt: new Date("2024-03-01T00:00:00Z"),
};

// ---------------------------------------------------------------------------
// Mock server builders
// ---------------------------------------------------------------------------

/** Builds a minimal server mock and returns the captured handler after registration. */
export function captureSandboxHandler(
  method: string,
  register: (server: any, ctx: any) => void,
  ctx: any,
) {
  let capturedHandler: ((opts: any) => Promise<any>) | null = null;
  const server = {
    io: {
      pocketenv: {
        sandbox: {
          [method]: (config: { handler: any }) => {
            capturedHandler = config.handler;
          },
        },
      },
    },
  };
  register(server, ctx);
  if (!capturedHandler) throw new Error(`Handler for ${method} was not registered`);
  return capturedHandler;
}

export function captureSecretHandler(
  method: string,
  register: (server: any, ctx: any) => void,
  ctx: any,
) {
  let capturedHandler: ((opts: any) => Promise<any>) | null = null;
  const server = {
    io: {
      pocketenv: {
        secret: {
          [method]: (config: { handler: any }) => {
            capturedHandler = config.handler;
          },
        },
      },
    },
  };
  register(server, ctx);
  if (!capturedHandler) throw new Error(`Handler for ${method} was not registered`);
  return capturedHandler;
}

// ---------------------------------------------------------------------------
// Auth mocks
// ---------------------------------------------------------------------------

export const authWithDid = (did = "did:plc:testuser") => ({
  credentials: { did },
  artifacts: false,
});

export const authNoCredentials = { artifacts: false };
