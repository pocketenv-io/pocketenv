import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";

vi.mock("@cloudflare/sandbox", () => ({
  proxyToSandbox: vi.fn().mockResolvedValue(null),
  getSandbox: vi.fn(),
  Sandbox: class {},
}));

vi.mock("../../drizzle", () => ({
  getConnection: vi.fn(() => ({})),
}));

vi.mock("@tsndr/cloudflare-worker-jwt", () => ({
  default: {
    verify: vi.fn().mockResolvedValue({ payload: { sub: "did:plc:test" } }),
  },
}));

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
};

vi.mock("../../lib/sandbox-helpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/sandbox-helpers")>();
  return {
    ...actual,
    getSandboxRecord: vi.fn(),
    createSandbox: vi.fn(),
    ensureSandboxId: vi.fn(),
    scheduleRepoClone: vi.fn(),
  };
});

vi.mock("../../providers", () => ({
  createSandbox: vi.fn(),
}));

import { getSandboxRecord } from "../../lib/sandbox-helpers";
import { sandboxRoutes } from "../../routes/sandboxes";

function makeApp() {
  const app = new Hono<{ Variables: { db: typeof mockDb; did: string; executionCtx: ExecutionContext } }>();
  app.use("*", (c, next) => {
    c.set("db", mockDb as any);
    c.set("did", "did:plc:test");
    return next();
  });
  app.route("/", sandboxRoutes);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /v1/sandboxes/:sandboxId", () => {
  it("returns the sandbox record when found", async () => {
    const fakeSandbox = { id: "sb-1", name: "test-sandbox", status: "RUNNING", provider: "cloudflare" };
    vi.mocked(getSandboxRecord).mockResolvedValue({
      sandbox: fakeSandbox as any,
      user: null,
    });

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/sb-1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ id: "sb-1", name: "test-sandbox" });
  });

  it("returns an empty body when sandbox not found", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue(undefined);

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/not-found");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("");
  });
});

describe("POST /v1/sandboxes/:sandboxId/stop", () => {
  it("returns 404 when sandbox not found", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue(undefined);

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/missing/stop", { method: "POST" });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toEqual({ error: "Sandbox not found" });
  });

  it("returns 400 for non-cloudflare provider", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue({
      sandbox: { id: "sb-1", provider: "other" } as any,
      user: null,
    });

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/sb-1/stop", { method: "POST" });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Sandbox provider not supported" });
  });

  it("returns 400 when sandbox has no sandboxId (not running)", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue({
      sandbox: { id: "sb-1", provider: "cloudflare", sandboxId: null } as any,
      user: null,
    });

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/sb-1/stop", { method: "POST" });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Sandbox is not running" });
  });
});

describe("POST /v1/sandboxes/:sandboxId/runs", () => {
  it("returns 404 when sandbox not found", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue(undefined);

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/missing/runs", {
      method: "POST",
      body: JSON.stringify({ command: "ls" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(404);
  });

  it("returns 400 for non-cloudflare provider", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue({
      sandbox: { id: "sb-1", provider: "other", status: "RUNNING" } as any,
      user: null,
    });

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/sb-1/runs", {
      method: "POST",
      body: JSON.stringify({ command: "ls" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Sandbox provider not supported" });
  });

  it("returns 400 when sandbox is not running", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue({
      sandbox: { id: "sb-1", provider: "cloudflare", status: "STOPPED" } as any,
      user: null,
    });

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/sb-1/runs", {
      method: "POST",
      body: JSON.stringify({ command: "ls" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Sandbox is not running" });
  });
});

describe("POST /v1/sandboxes/:sandboxId/ports", () => {
  it("returns 400 for an invalid port (below range)", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue({
      sandbox: { id: "sb-1", provider: "cloudflare", sandboxId: "cf-1" } as any,
      user: null,
    });

    const { createSandbox } = await import("../../providers");
    vi.mocked(createSandbox).mockResolvedValue({ expose: vi.fn() } as any);

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/sb-1/ports", {
      method: "POST",
      body: JSON.stringify({ port: 80 }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid port number" });
  });

  it("returns 400 for reserved port 3000", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue({
      sandbox: { id: "sb-1", provider: "cloudflare", sandboxId: "cf-1" } as any,
      user: null,
    });

    const { createSandbox } = await import("../../providers");
    vi.mocked(createSandbox).mockResolvedValue({ expose: vi.fn() } as any);

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/sb-1/ports", {
      method: "POST",
      body: JSON.stringify({ port: 3000 }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid port number" });
  });
});

describe("DELETE /v1/sandboxes/:sandboxId", () => {
  it("returns 404 when sandbox not found", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue(undefined);

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/missing", { method: "DELETE" });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Sandbox not found" });
  });

  it("returns 400 for non-cloudflare provider", async () => {
    vi.mocked(getSandboxRecord).mockResolvedValue({
      sandbox: { id: "sb-1", provider: "other" } as any,
      user: null,
    });

    const app = makeApp();
    const res = await app.request("/v1/sandboxes/sb-1", { method: "DELETE" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Sandbox provider not supported" });
  });
});
