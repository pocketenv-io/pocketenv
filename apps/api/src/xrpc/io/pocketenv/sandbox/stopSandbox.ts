import type { HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/stopSandbox";
import generateJwt from "lib/generateJwt";

export default function (server: Server, ctx: Context) {
  const stopSandbox = async (params: QueryParams, auth: HandlerAuth) => {
    await ctx.sandbox.post(`/v1/sandboxes/${params.id}/stop`, undefined, {
      ...(auth?.credentials && {
        headers: {
          Authorization: `Bearer ${await generateJwt(auth.credentials.did)}`,
        },
      }),
    });
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
