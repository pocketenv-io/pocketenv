import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/secret/getSecrets";

export default function (server: Server, ctx: Context) {
  const getSecrets = async (params: QueryParams, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.secret.getSecrets({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getSecrets(params, auth);
      return {
        encoding: "application/json",
        body: result as any, // TODO: Implement getSecrets
      };
    },
  });
}
