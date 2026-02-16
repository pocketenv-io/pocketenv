import type { HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/stopSandbox";

export default function (server: Server, ctx: Context) {
  const stopSandbox = async (params: QueryParams, auth: HandlerAuth) => {
    await ctx.sandbox.post(`/v1/sandboxes/${params.id}/stop`);
    return {};
  };
  server.io.pocketenv.sandbox.stopSandbox({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await stopSandbox(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
