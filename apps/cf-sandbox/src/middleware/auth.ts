import { MiddlewareHandler } from "hono";
import { Context } from "../context";
import { getSandbox } from "@cloudflare/sandbox";
import { Sandbox } from "@cloudflare/sandbox";
import { getConnection } from "../drizzle";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { consola } from "consola";

type Bindings = { Sandbox: DurableObjectNamespace<Sandbox<Env>> };

export const authMiddleware: MiddlewareHandler<{
  Variables: Context;
  Bindings: Bindings;
}> = async (c, next) => {
  c.set("db", getConnection());

  const token = c.req.header("Authorization")?.split(" ")[1]?.trim();
  if (token) {
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET!);
      c.set(
        "did",
        decoded?.payload?.sub || (decoded?.payload as { did: string })?.did,
      );
    } catch (err) {
      consola.error("JWT verification failed:", err);
      return c.json({ error: "Unauthorized" }, 401);
    }
  } else {
    if (!c.req.path.endsWith("/ws/terminal") && c.req.path !== "/") {
      consola.warn("No Authorization header found");
      return c.json({ error: "Unauthorized" }, 401);
    }
  }

  await next();
};
