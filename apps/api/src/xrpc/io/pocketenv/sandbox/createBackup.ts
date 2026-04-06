import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  InputSchema,
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/sandbox/createBackup";
import generateJwt from "lib/generateJwt";
import schema from "schema";
import type { SelectBakcup } from "schema/backups";

export default function (server: Server, ctx: Context) {
  const createBackup = async (
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

    const { data: backup } = await sandbox.post<SelectBakcup>(
      `/v1/sandboxes/${record.sandboxes.id}/backup`,
      {
        directory: input.directory,
        description: input.description,
        ttl: input.ttl,
      },
      {
        headers: {
          Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
        },
      },
    );

    return {
      id: backup.backupId,
      directory: backup.directory,
      description: backup.description,
      expiresAt: backup.expiresAt
        ? new Date(backup.expiresAt).toISOString()
        : undefined,
      createdAt: new Date(backup.createdAt).toISOString(),
    } satisfies OutputSchema;
  };
  server.io.pocketenv.sandbox.createBackup({
    auth: ctx.authVerifier,
    handler: async ({ input, params, auth }) => {
      const result = await createBackup(input.body, params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
