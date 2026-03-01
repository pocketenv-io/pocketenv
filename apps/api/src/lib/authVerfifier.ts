import type { AuthOutput } from "@atproto/xrpc-server";
import type express from "express";
import jwt from "jsonwebtoken";
import { env } from "./env";
import validateTurnstile from "./turnstile";

type ReqCtx = {
  req: express.Request;
};

export default async function authVerifier(ctx: ReqCtx): Promise<AuthOutput> {
  const challenge = ctx.req.headers["x-challenge"]?.toString();
  let artifacts = false;

  if (challenge) {
    const ip: string =
      ctx.req.headers["cf-connecting-ip"]?.toString() ||
      ctx.req.headers["x-forwarded-for"]?.toString() ||
      "unknown";
    const validation = await validateTurnstile(challenge, ip);
    artifacts = (validation as { success: boolean }).success;
  }

  if (!ctx.req.headers.authorization) {
    return {
      artifacts,
    };
  }

  const bearer = (ctx.req.headers.authorization || "").split(" ")[1]?.trim();

  if (bearer && bearer !== "null") {
    const credentials = jwt.verify(bearer, env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    return {
      credentials,
      artifacts,
    };
  }

  return {
    artifacts,
  };
}
