import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/volume/deleteVolume";
import sandboxVolumes from "schema/sandbox-volumes";

export default function (server: Server, ctx: Context) {
  const deleteVolume = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db
      .delete(sandboxVolumes)
      .where(
        or(
          eq(sandboxVolumes.id, params.id),
          eq(sandboxVolumes.volumeId, params.id),
        ),
      );

    return {};
  };
  server.io.pocketenv.volume.deleteVolume({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteVolume(params, auth);
    },
  });
}
