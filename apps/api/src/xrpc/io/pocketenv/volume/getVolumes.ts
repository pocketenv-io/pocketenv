import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/volume/getVolumes";

export default function (server: Server, ctx: Context) {
  const getVolumes = async (params: QueryParams, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.volume.getVolumes({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getVolumes(params, auth);
      return result as any; // TODO: Implement getVolumes handler
    },
  });
}
