import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { and, eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/sandbox/getExposedPorts";
import schema from "schema";
import sandboxPorts from "schema/sandbox-ports";

export default function (server: Server, ctx: Context) {
  const getExposedPorts = async (
    params: QueryParams,
    auth: HandlerAuth,
  ): Promise<OutputSchema> => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }
    const records = await ctx.db
      .select()
      .from(sandboxPorts)
      .leftJoin(
        schema.sandboxes,
        eq(sandboxPorts.sandboxId, schema.sandboxes.id),
      )
      .leftJoin(schema.users, eq(schema.sandboxes.userId, schema.users.id))
      .where(
        and(
          eq(sandboxPorts.sandboxId, params.id),
          eq(schema.users.did, auth.credentials.did),
        ),
      )
      .execute();
    return {
      ports: records.map((record) => ({
        port: record.sandbox_ports.exposedPort,
        description: record.sandbox_ports.description || undefined,
        previewUrl: record.sandbox_ports.previewUrl || undefined,
      })),
    };
  };
  server.io.pocketenv.sandbox.getExposedPorts({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getExposedPorts(params, auth);
      return {
        encoding: "application/json",
        body: result satisfies OutputSchema,
      };
    },
  });
}
