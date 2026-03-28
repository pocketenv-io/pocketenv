import type { Server } from "lexicon";
import type { Context } from "context";
import type { QueryParams } from "lexicon/types/io/pocketenv/service/stopService";
import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import schema from "schema";
import { and, eq } from "drizzle-orm";
import { Providers } from "consts";
import generateJwt from "lib/generateJwt";
import { consola } from "consola";

export default function (server: Server, ctx: Context) {
  const stopService = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const records = await ctx.db
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

    if (records.length === 0) {
      throw new XRPCError(404, "Service not found");
    }

    const [record] = records;
    const sandbox =
      record!.sandboxes!.provider === Providers.CLOUDFLARE
        ? ctx.cfsandbox(record!.sandboxes!.base!)
        : ctx.sandbox();

    if (record?.sandboxes?.status === "STOPPED") {
      consola.info("Service is already stopped, skipping stop", {
        params,
        auth,
      });
      return;
    }

    await sandbox.delete(
      `/v1/sandboxes/${record!.sandboxes!.id}/services/${params.serviceId}`,
      {
        headers: {
          Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
        },
      },
    );
  };

  server.io.pocketenv.service.stopService({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await stopService(params, auth);
    },
  });
}
