import type { Server } from "lexicon";
import type { Context } from "context";
import type {
  HandlerInput,
  QueryParams,
} from "lexicon/types/io/pocketenv/service/updateService";
import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import schema from "schema";
import { and, eq } from "drizzle-orm";

export default function (server: Server, ctx: Context) {
  const updateService = async (
    input: HandlerInput,
    params: QueryParams,
    auth: HandlerAuth,
  ) => {
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

    await ctx.db.transaction(async (tx) => {
      await tx
        .update(schema.services)
        .set({
          name: input.body.service.name,
          description: input.body.service.description,
          command: input.body.service.command,
        })
        .where(and(eq(schema.services.id, params.serviceId)));

      if (input.body.service.ports) {
        await tx
          .delete(schema.sandboxPorts)
          .where(eq(schema.sandboxPorts.serviceId, params.serviceId))
          .execute();

        await Promise.all(
          input.body.service.ports.map((port) =>
            tx
              .insert(schema.sandboxPorts)
              .values({
                sandboxId: records[0]!.services.sandboxId,
                serviceId: params.serviceId,
                exposedPort: port,
                description: `Port ${port} for service ${input.body.service.name}`,
              })
              .execute(),
          ),
        );
      }
    });
  };

  server.io.pocketenv.service.updateService({
    auth: ctx.authVerifier,
    handler: async ({ input, params, auth }) => {
      await updateService(input, params, auth);
    },
  });
}
