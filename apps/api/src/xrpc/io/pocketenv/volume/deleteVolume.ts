import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/volume/deleteVolume";

export default function (server: Server, ctx: Context) {
  const deleteVolume = async (params: QueryParams, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.volume.deleteVolume({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteVolume(params, auth);
    },
  });
}
