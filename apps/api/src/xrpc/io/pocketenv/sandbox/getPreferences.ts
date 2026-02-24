import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/getPreferences";

export default function (server: Server, ctx: Context) {
  const getPreferences = async (params: QueryParams, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.sandbox.getPreferences({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getPreferences(params, auth);
      return {
        encoding: "application/json",
        body: result as any, // TODO: Implement getPreferences
      };
    },
  });
}
