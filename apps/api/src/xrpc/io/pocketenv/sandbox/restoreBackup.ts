import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  InputSchema,
  QueryParams,
} from "lexicon/types/io/pocketenv/sandbox/restoreBackup";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const restoreBackup = async (
    input: InputSchema,
    params: QueryParams,
    auth: HandlerAuth,
  ) => {
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

    if (record.sandboxes.provider !== Providers.CLOUDFLARE) {
      throw new XRPCError(400, "Sandbox provider does not support backup");
    }

    const sandbox =
      record.sandboxes.provider === Providers.CLOUDFLARE
        ? ctx.cfsandbox(record.sandboxes.base!)
        : ctx.sandbox();

    try {
      await sandbox.post(
        `/v1/sandboxes/${record.sandboxes.id}/restore`,
        {
          backupId: input.backupId,
        },
        {
          headers: {
            Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
          },
        },
      );
    } catch (error) {
      console.warn("Failed to restore backup", error);
    }

    return {};
  };
  server.io.pocketenv.sandbox.restoreBackup({
    auth: ctx.authVerifier,
    handler: async ({ input, params, auth }) => {
      await restoreBackup(input.body, params, auth);
    },
  });
}
