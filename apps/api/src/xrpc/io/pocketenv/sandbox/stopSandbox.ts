import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { and, eq, isNull, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/stopSandbox";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const stopSandbox = async (params: QueryParams, auth: HandlerAuth) => {
    let userId: string | undefined;
    if (auth.credentials) {
      const [user] = await ctx.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.did, auth.credentials.did))
        .execute();
      userId = user?.id;
    }

    const record = await ctx.db
      .select()
      .from(schema.sandboxes)
      .where(
        and(
          or(
            eq(schema.sandboxes.id, params.id),
            eq(schema.sandboxes.name, params.id),
          ),
          userId
            ? eq(schema.sandboxes.userId, userId)
            : isNull(schema.sandboxes.userId),
        ),
      )
      .execute()
      .then(([row]) => row);

    if (!record) {
      throw new XRPCError(404, "Sandbox not found", "SandboxNotFound");
    }

    const sandbox =
      record.provider === Providers.CLOUDFLARE
        ? ctx.cfsandbox(record.base!)
        : ctx.sandbox(record?.provider);

    await sandbox.post(`/v1/sandboxes/${record.id}/stop`, undefined, {
      headers: {
        Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
      },
    });
    return {};
  };
  server.io.pocketenv.sandbox.stopSandbox({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await stopSandbox(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
