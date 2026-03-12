import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/file/updateFile";
import files from "schema/files";
import sandboxFiles from "schema/sandbox-files";

export default function (server: Server, ctx: Context) {
  const updateFile = async (input: HandlerInput, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.transaction(async (tx) => {
      const [file] = await tx
        .update(sandboxFiles)
        .set({ path: input.body.file.path, updatedAt: new Date() })
        .where(eq(sandboxFiles.id, input.body.id))
        .returning()
        .execute();

      if (!file?.id) throw new XRPCError(404, "File not found");

      await tx
        .update(files)
        .set({ content: input.body.file.content, updatedAt: new Date() })
        .where(eq(files.id, file.id))
        .execute();
    });
    return {};
  };
  server.io.pocketenv.file.updateFile({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await updateFile(input, auth);
    },
  });
}
