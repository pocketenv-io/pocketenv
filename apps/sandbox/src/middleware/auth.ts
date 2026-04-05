import { Context } from "../context.ts";
import { consola } from "consola";
import { MiddlewareHandler } from "hono";
import { getConnection } from "../drizzle.ts";
import jwt from "@tsndr/cloudflare-worker-jwt";
import process from "node:process";

export const authMiddleware: MiddlewareHandler<{ Variables: Context }> = async (
  c,
  next,
) => {
  c.set("db", getConnection());
  const token = c.req.header("Authorization")?.split(" ")[1]?.trim();
  if (token) {
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET!);
      c.set("did", decoded?.payload.sub);
    } catch (err) {
      consola.error("JWT verification failed:", err);
      return c.json({ error: "Unauthorized" }, 401);
    }
  } else {
    if (c.req.path === "/") {
      await next();
      return;
    }
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};
