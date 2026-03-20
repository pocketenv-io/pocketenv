import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { and, eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  InputSchema,
  QueryParams,
} from "lexicon/types/io/pocketenv/sandbox/unexposePort";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const unexposePort = async (
    params: QueryParams,
    input: InputSchema,
    auth: HandlerAuth,
  ) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.transaction(async (tx) => {
      const [record] = await tx
        .select()
        .from(schema.sandboxes)
        .leftJoin(schema.users, eq(schema.sandboxes.userId, schema.users.id))
        .where(
          and(
            eq(schema.sandboxes.id, params.id),
            eq(schema.users.did, auth.credentials.did),
          ),
        )
        .execute();

      if (!record) {
        throw new XRPCError(404, "Sandbox not found");
      }

      await tx
        .delete(schema.sandboxPorts)
        .where(
          and(
            eq(schema.sandboxPorts.sandboxId, record.sandboxes.id),
            eq(schema.sandboxPorts.exposedPort, input.port),
          ),
        )
        .execute();

      const sandbox =
        record.sandboxes.provider === Providers.CLOUDFLARE
          ? ctx.cfsandbox(record.sandboxes.base!)
          : ctx.sandbox();

      await sandbox.delete(`/v1/sandboxes/${record.sandboxes.id}/ports`, {
        params: {
          port: input.port,
        },
        headers: {
          Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
        },
      });
    });
  };
  server.io.pocketenv.sandbox.unexposePort({
    auth: ctx.authVerifier,
    handler: async ({ params, input, auth }) => {
      await unexposePort(params, input.body, auth);
    },
  });
}
