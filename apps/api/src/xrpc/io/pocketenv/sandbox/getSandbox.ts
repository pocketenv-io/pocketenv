import type { HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/getSandbox";

export default function (server: Server, ctx: Context) {
  const getSandbox = (params: QueryParams, auth: HandlerAuth) => ({});
  server.io.pocketenv.sandbox.getSandbox({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = getSandbox(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
