import { Hono } from "hono";
import { Context } from "../context";
import { Sandbox } from "@cloudflare/sandbox";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { sandboxCp } from "../schema";

type Bindings = { Sandbox: DurableObjectNamespace<Sandbox<Env>> };
type App = { Variables: Context; Bindings: Bindings };

export const cpRoutes = new Hono<App>();

cpRoutes.post("/cp", async (c) => {
  if (!c.var.did) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return c.json({ error: "No file uploaded" }, 400);
  }

  const fileBuffer = await file.arrayBuffer();
  const uuid = c.req.query("uuid") || crypto.randomUUID();
  await env.POCKETENV_COPY.put(uuid, fileBuffer);

  c.executionCtx.waitUntil(
    c.var.db.insert(sandboxCp).values({ copyUuid: uuid }).execute(),
  );

  return c.json({ uuid });
});

cpRoutes.get("/cp/:uuid", async (c) => {
  const { uuid } = c.req.param();
  const file = await env.POCKETENV_COPY.get(uuid);
  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  await c.var.db.delete(sandboxCp).where(eq(sandboxCp.copyUuid, uuid)).execute();
  await env.POCKETENV_COPY.delete(uuid);

  return c.body(file.body, 200, {
    "Content-Type": "application/gzip",
    "Content-Disposition": `attachment; filename="${uuid}.tar.gz"`,
  });
});
