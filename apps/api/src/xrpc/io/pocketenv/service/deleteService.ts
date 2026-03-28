import type { Server } from "lexicon";
import type { Context } from "context";
import type { QueryParams } from "lexicon/types/io/pocketenv/service/deleteService";
import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import schema from "schema";
import { and, eq } from "drizzle-orm";
import { Providers } from "consts";
import generateJwt from "lib/generateJwt";

export default function (server: Server, ctx: Context) {
  const deleteService = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const [record] = await ctx.db
      .select()
      .from(schema.services)
      .leftJoin(
        schema.sandboxes,
        eq(schema.sandboxes.id, schema.services.sandboxId),
      )
      .leftJoin(schema.users, eq(schema.users.id, schema.sandboxes.userId))
      .where(
        and(
          eq(schema.services.id, params.serviceId),
          eq(schema.users.did, auth.credentials.did),
        ),
      )
      .execute();

    if (!record?.sandboxes) {
      throw new XRPCError(404, "Service not found");
    }

    // stop service
    const sandbox =
      record.sandboxes.provider === Providers.CLOUDFLARE
        ? ctx.cfsandbox(record.sandboxes.base!)
        : ctx.sandbox();
    await sandbox.delete(
      `/v1/sandboxes/${record.sandboxes.id}/services/${params.serviceId}`,
      {
        headers: {
          Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
        },
      },
    );

    await ctx.db.transaction(async (tx) => {
      await tx
        .delete(schema.sandboxPorts)
        .where(eq(schema.sandboxPorts.serviceId, params.serviceId))
        .execute();
      await tx
        .delete(schema.services)
        .where(eq(schema.services.id, params.serviceId))
        .execute();
    });
  };

  server.io.pocketenv.service.deleteService({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteService(params, auth);
    },
  });
}
