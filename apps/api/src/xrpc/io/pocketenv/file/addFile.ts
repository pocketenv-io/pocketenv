import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/file/addFile";
import files from "schema/files";
import sandboxFiles from "schema/sandbox-files";

export default function (server: Server, ctx: Context) {
  const addFile = async (input: HandlerInput, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.transaction(async (tx) => {
      const [file] = await tx
        .insert(files)
        .values({
          content: input.body.file.content,
        })
        .returning()
        .execute();

      if (!file?.id) throw new XRPCError(500, "Failed to insert file");

      if (!input.body.file.sandboxId) {
        return;
      }

      await tx
        .insert(sandboxFiles)
        .values({
          fileId: file.id,
          sandboxId: input.body.file.sandboxId,
          path: input.body.file.path,
        })
        .execute();
    });
    return {};
  };
  server.io.pocketenv.file.addFile({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await addFile(input, auth);
    },
  });
}
