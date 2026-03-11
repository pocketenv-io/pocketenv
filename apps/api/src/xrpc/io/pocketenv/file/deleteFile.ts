import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/file/deleteFile";
import sandboxFiles from "schema/sandbox-files";

export default function (server: Server, ctx: Context) {
  const deleteFile = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.delete(sandboxFiles).where(eq(sandboxFiles.id, params.id));

    return {};
  };
  server.io.pocketenv.file.deleteFile({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteFile(params, auth);
    },
  });
}
