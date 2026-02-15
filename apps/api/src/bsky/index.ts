import { isValidHandle } from "@atproto/syntax";
import { SCOPES } from "auth/client";
import { Router } from "express";
import { env } from "lib/env";
import jwt from "jsonwebtoken";
import extractPdsFromDid from "lib/extractPdsFromDid";
import AtpAgent from "@atproto/api";
import { omit } from "ramda";
import { consola } from "consola";

const app = Router();

app.get("/login", async (req, res) => {
  const { handle, prompt } = req.query;

  if ((typeof handle !== "string" || !isValidHandle(handle)) && !prompt) {
    res.status(400).send("Invalid handle");
    return;
  }

  const url = await req.ctx.oauthClient.authorize(
    prompt ? "tsiry.selfhosted.social" : (handle as string),
    {
      scope: SCOPES.join(" "),
      // @ts-expect-error: allow custom prompt param
      prompt: prompt as string,
    },
  );
  res.redirect(url.toString());
});

app.post("/login", async (req, res) => {
  const { handle, cli, password } = req.body;
  if (typeof handle !== "string" || !isValidHandle(handle)) {
    res.status(400);
    res.send("Invalid handle");
    return;
  }

  if (password) {
    const defaultAgent = new AtpAgent({
      service: new URL("https://bsky.social"),
    });
    const {
      data: { did },
    } = await defaultAgent.resolveHandle({ handle });

    let pds = await req.ctx.redis.get(`pds:${did}`);
    if (!pds) {
      pds = await extractPdsFromDid(did);
      await req.ctx.redis.setEx(`pds:${did}`, 60 * 15, pds!);
    }

    const agent = new AtpAgent({
      service: new URL(pds!),
    });

    await agent.login({
      identifier: handle,
      password,
    });

    await req.ctx.sqliteDb
      .insertInto("auth_session")
      .values({
        key: `atp:${did}`,
        session: JSON.stringify(agent.session),
      })
      .onConflict((oc) =>
        oc
          .column("key")
          .doUpdateSet({ session: JSON.stringify(agent.session) }),
      )
      .execute();

    const token = jwt.sign(
      {
        did,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      env.JWT_SECRET,
    );

    res.send(`jwt:${token}`);
    return;
  }

  const url = await req.ctx.oauthClient.authorize(handle, {
    scope: SCOPES.join(" "),
  });

  if (cli) {
    req.ctx.kv.set(`cli:${handle}`, "1");
  }

  res.send(url.toString());
});

app.get("/oauth/callback", async (req, res) => {
  const params = new URLSearchParams(req.url.split("?")[1]);
  let did: string, cli: string | undefined;

  try {
    const { session } = await req.ctx.oauthClient.callback(params);
    did = session.did;
    const handle = await req.ctx.resolver.resolveDidToHandle(did);
    cli = req.ctx.kv.get(`cli:${handle}`);
    req.ctx.kv.delete(`cli:${handle}`);

    const token = jwt.sign(
      {
        did,
        exp: cli
          ? Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 1000
          : Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      },
      env.JWT_SECRET,
    );
    req.ctx.kv.set(did, token);
  } catch (err) {
    consola.error({ err }, "oauth callback failed");
    res.redirect(`${env.FRONTEND_URL}?error=1`);
    return;
  }

  res.redirect(`${env.FRONTEND_URL}?did=${did}&cli=${cli}`);
});

app.get("/token", async (req, res) => {
  const did = req.header("session-did");

  if (typeof did !== "string" || !did || did === "null") {
    res.status(401);
    res.send("Unauthorized");
    return;
  }

  const token = req.ctx.kv.get(did);

  if (!token) {
    res.status(401);
    res.send("Unauthorized");
    return;
  }

  req.ctx.kv.delete(did);

  res.json({ token });
});

app.get("/client-metadata.json", (req, res) => {
  res.json(req.ctx.oauthClient.clientMetadata);
});

app.get("/oauth-client-metadata.json", (req, res) => {
  res.json(req.ctx.oauthClient.clientMetadata);
});

app.get("/jwks.json", (_req, res) =>
  res.json({
    keys: [
      omit(["d"], JSON.parse(env.PRIVATE_KEY_1)),
      omit(["d"], JSON.parse(env.PRIVATE_KEY_2)),
      omit(["d"], JSON.parse(env.PRIVATE_KEY_3)),
    ],
  }),
);

export default app;
