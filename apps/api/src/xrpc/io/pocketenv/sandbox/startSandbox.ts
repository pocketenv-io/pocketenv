import type { HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/startSandbox";

export default function (server: Server, ctx: Context) {
  const startSandbox = async (params: QueryParams, auth: HandlerAuth) => {
    await ctx.sandbox.post(`/v1/sandboxes/${params.id}/start`);
    return {};
  };
  server.io.pocketenv.sandbox.startSandbox({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await startSandbox(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
