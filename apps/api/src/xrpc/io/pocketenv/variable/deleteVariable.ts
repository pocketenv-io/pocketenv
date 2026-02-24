import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/variable/deleteVariable";

export default function (server: Server, ctx: Context) {
  const deleteVariable = async (params: QueryParams, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.variable.deleteVariable({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteVariable(params, auth);
    },
  });
}
