import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";

vi.mock("consola", () => ({
  consola: { warn: vi.fn(), error: vi.fn() },
}));

vi.mock("@cloudflare/sandbox", () => ({
  getSandbox: vi.fn(),
  Sandbox: class {},
}));

vi.mock("../../drizzle", () => ({
  getConnection: vi.fn(() => ({})),
}));

const { mockJwt } = vi.hoisted(() => {
  const mockJwt = { verify: vi.fn() };
  return { mockJwt };
});

vi.mock("@tsndr/cloudflare-worker-jwt", () => ({
  default: mockJwt,
}));

function makeApp() {
  const app = new Hono();
  app.use("*", authMiddleware as any);
  app.get("/", (c) => c.text("ok"));
  app.get("/v1/test", (c) => c.text("authenticated"));
  app.get("/ws/terminal", (c) => c.text("terminal"));
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = "test-secret";
});

describe("authMiddleware", () => {
  it("allows request to / without auth", async () => {
    const app = makeApp();
    const res = await app.request("/");
    expect(res.status).toBe(200);
  });

  it("allows request to /ws/terminal without auth", async () => {
    const app = makeApp();
    const res = await app.request("/ws/terminal");
    expect(res.status).toBe(200);
  });

  it("returns 401 when no Authorization header on protected route", async () => {
    const app = makeApp();
    const res = await app.request("/v1/test");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 when JWT verification fails", async () => {
    mockJwt.verify.mockRejectedValue(new Error("invalid token"));

    const app = makeApp();
    const res = await app.request("/v1/test", {
      headers: { Authorization: "Bearer bad-token" },
    });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("sets did from JWT sub claim and proceeds", async () => {
    mockJwt.verify.mockResolvedValue({ payload: { sub: "did:plc:abc123" } });

    let capturedDid: string | undefined;
    const app = new Hono();
    app.use("*", authMiddleware as any);
    app.get("/v1/test", (c) => {
      capturedDid = c.var.did;
      return c.text("ok");
    });

    const res = await app.request("/v1/test", {
      headers: { Authorization: "Bearer valid-token" },
    });
    expect(res.status).toBe(200);
    expect(capturedDid).toBe("did:plc:abc123");
  });

  it("sets did from legacy JWT did claim and proceeds", async () => {
    mockJwt.verify.mockResolvedValue({ payload: { did: "did:plc:legacy" } });

    let capturedDid: string | undefined;
    const app = new Hono();
    app.use("*", authMiddleware as any);
    app.get("/v1/test", (c) => {
      capturedDid = c.var.did;
      return c.text("ok");
    });

    const res = await app.request("/v1/test", {
      headers: { Authorization: "Bearer legacy-token" },
    });
    expect(res.status).toBe(200);
    expect(capturedDid).toBe("did:plc:legacy");
  });
});
