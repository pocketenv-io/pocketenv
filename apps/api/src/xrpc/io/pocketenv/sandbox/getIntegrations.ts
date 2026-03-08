import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/getIntegrations";

export default function (server: Server, ctx: Context) {
  const getIntegrations = async (params: QueryParams, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.sandbox.getIntegrations({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getIntegrations(params, auth);
      return {
        encoding: "application/json",
        body: result as any, // TODO: Implement getIntegrations
      };
    },
  });
}
