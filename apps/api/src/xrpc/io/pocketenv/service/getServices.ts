import type { Server } from "lexicon";
import type { Context } from "context";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/service/getServices";
import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import schema from "schema";
import { and, eq, or } from "drizzle-orm";

export default function (server: Server, ctx: Context) {
  const getServices = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const services = await ctx.db
      .select()
      .from(schema.services)
      .leftJoin(
        schema.sandboxes,
        eq(schema.sandboxes.id, schema.services.sandboxId),
      )
      .leftJoin(schema.users, eq(schema.users.id, schema.sandboxes.userId))
      .where(
        and(
          or(
            eq(schema.services.sandboxId, params.sandboxId),
            eq(schema.sandboxes.name, params.sandboxId),
            eq(schema.sandboxes.uri, params.sandboxId),
          ),
          eq(schema.users.did, auth.credentials.did),
        ),
      )
      .execute()
      .then((results) =>
        results.map(({ services }) => services).filter((service) => service),
      );

    return {
      services: services.map((record) => ({
        id: record.id,
        name: record.name,
        description: record.description!,
        command: record.command,
      })),
    } satisfies OutputSchema;
  };

  server.io.pocketenv.service.getServices({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getServices(params, auth);
      return {
        encoding: "application/json",
        body: result satisfies OutputSchema,
      };
    },
  });
}
