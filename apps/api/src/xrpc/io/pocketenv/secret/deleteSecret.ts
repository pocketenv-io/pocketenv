import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/secret/deleteSecret";

export default function (server: Server, ctx: Context) {
  const deleteSecret = async (params: QueryParams, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.secret.deleteSecret({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteSecret(params, auth);
    },
  });
}
