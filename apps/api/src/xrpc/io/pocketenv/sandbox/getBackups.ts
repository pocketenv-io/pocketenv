import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/sandbox/getBackups";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const getBackups = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const [record] = await ctx.db
      .select()
      .from(schema.sandboxes)
      .leftJoin(schema.users, eq(schema.sandboxes.userId, schema.users.id))
      .where(
        and(
          or(
            eq(schema.sandboxes.id, params.id),
            eq(schema.sandboxes.uri, params.id),
            eq(schema.sandboxes.name, params.id),
          ),
          eq(schema.users.did, auth.credentials.did),
        ),
      )
      .execute();

    if (!record) {
      throw new XRPCError(404, "Sandbox not found");
    }

    const backups = await ctx.db
      .select()
      .from(schema.backups)
      .where(eq(schema.backups.sandboxId, record.sandboxes.id))
      .execute();

    return {
      backups: backups.map((backup) => ({
        id: backup.backupId,
        directory: backup.directory,
        description: backup.description,
        expiresAt: backup.expiresAt?.toISOString(),
        createdAt: backup.createdAt.toISOString(),
      })),
    };
  };
  server.io.pocketenv.sandbox.getBackups({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getBackups(params, auth);
      return {
        encoding: "application/json",
        body: result satisfies OutputSchema,
      };
    },
  });
}
