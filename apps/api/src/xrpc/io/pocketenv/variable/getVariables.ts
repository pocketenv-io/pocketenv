import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/variable/getVariables";

export default function (server: Server, ctx: Context) {
  const getVariables = async (params: QueryParams, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.variable.getVariables({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getVariables(params, auth);
      return result as any; // TODO: Implement getVariables handler
    },
  });
}
