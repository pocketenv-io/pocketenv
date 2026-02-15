import type { HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/claimSandbox";

export default function (server: Server, ctx: Context) {
  const claimSandbox = (params: QueryParams, auth: HandlerAuth) => ({});
  server.io.pocketenv.sandbox.claimSandbox({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = claimSandbox(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
