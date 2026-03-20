import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { and, eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  InputSchema,
} from "lexicon/types/io/pocketenv/sandbox/exposePort";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const exposePort = async (
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

      await ctx.db
        .insert(schema.sandboxPorts)
        .values({
          sandboxId: record.sandboxes.id,
          exposedPort: input.port,
          description: input.description,
        })
        .execute();

      const sandbox =
        record.sandboxes.provider === Providers.CLOUDFLARE
          ? ctx.cfsandbox(record.sandboxes.base!)
          : ctx.sandbox();

      const { data } = await sandbox.post<{ previewUrl: string }>(
        `/v1/sandboxes/${record.sandboxes.id}/ports`,
        {
          port: input.port,
        },
        {
          headers: {
            Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
          },
        },
      );

      if (data.previewUrl) {
        await ctx.db
          .update(schema.sandboxPorts)
          .set({ previewUrl: data.previewUrl })
          .where(
            and(
              eq(schema.sandboxPorts.sandboxId, record.sandboxes.id),
              eq(schema.sandboxPorts.exposedPort, input.port),
            ),
          )
          .execute();
      }
    });
  };
  server.io.pocketenv.sandbox.exposePort({
    auth: ctx.authVerifier,
    handler: async ({ params, input, auth }) => {
      await exposePort(params, input.body, auth);
    },
  });
}
