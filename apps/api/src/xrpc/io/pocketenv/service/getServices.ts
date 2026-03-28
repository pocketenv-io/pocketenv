import type { Server } from "lexicon";
import type { Context } from "context";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/service/getServices";
import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import schema from "schema";
import { eq } from "drizzle-orm";

export default function (server: Server, ctx: Context) {
  const getServices = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const services = await ctx.db
      .select()
      .from(schema.services)
      .where(eq(schema.services.sandboxId, params.sandboxId))
      .execute();

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
