import type { AuthOutput } from "@atproto/xrpc-server";
import type express from "express";
import jwt from "jsonwebtoken";
import { env } from "./env";

type ReqCtx = {
  req: express.Request;
};

export default function authVerifier(ctx: ReqCtx): AuthOutput {
  if (!ctx.req.headers.authorization) {
    return {};
  }

  const bearer = (ctx.req.headers.authorization || "").split(" ")[1]?.trim();

  if (bearer && bearer !== "null") {
    const credentials = jwt.verify(bearer, env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    return {
      credentials,
    };
  }

  return {};
}
