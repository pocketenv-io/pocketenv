import type { HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/stopSandbox";

export default function (server: Server, ctx: Context) {
  const stopSandbox = (params: QueryParams, auth: HandlerAuth) => ({});
  server.io.pocketenv.sandbox.deleteSandbox({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = stopSandbox(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
