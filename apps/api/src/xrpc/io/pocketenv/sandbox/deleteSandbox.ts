import type { HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/deleteSandbox";
import generateJwt from "lib/generateJwt";

export default function (server: Server, ctx: Context) {
  const deleteSandbox = async (params: QueryParams, auth: HandlerAuth) => {
    await ctx.sandbox.delete(`/v1/sandboxes/${params.id}`, {
      ...(auth?.credentials && {
        headers: {
          Authorization: `Bearer ${generateJwt(auth.credentials.did)}`,
        },
      }),
    });
    return {};
  };
  server.io.pocketenv.sandbox.deleteSandbox({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await deleteSandbox(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
