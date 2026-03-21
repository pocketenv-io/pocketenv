import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/file/addFile";
import files from "schema/files";
import sandboxFiles from "schema/sandbox-files";
import sandboxes from "schema/sandboxes";
import users from "schema/users";

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

      const [sandbox] = await tx
        .select()
        .from(sandboxes)
        .leftJoin(users, eq(sandboxes.userId, users.id))
        .where(
          and(
            or(
              eq(sandboxes.id, input.body.file.sandboxId),
              eq(sandboxes.name, input.body.file.sandboxId),
            ),
            eq(users.did, auth.credentials.did),
          ),
        )
        .execute();

      if (!sandbox) {
        throw new XRPCError(404, "Sandbox not found");
      }

      await tx
        .insert(sandboxFiles)
        .values({
          fileId: file.id,
          sandboxId: sandbox.sandboxes.id,
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
