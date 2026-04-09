import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { eq, or, isNull, and } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/deleteSandbox";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const deleteSandbox = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const [user] = await ctx.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.did, auth.credentials.did))
      .execute();

    const record = await ctx.db
      .select()
      .from(schema.sandboxes)
      .where(
        and(
          or(
            eq(schema.sandboxes.id, params.id),
            eq(schema.sandboxes.name, params.id),
          ),
          user
            ? eq(schema.sandboxes.userId, user.id)
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

    try {
      await sandbox.delete(`/v1/sandboxes/${record.id}`, {
        headers: {
          Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
        },
      });
    } catch (err: unknown) {
      throw new XRPCError(
        502,
        "Failed to delete sandbox with the provider",
        "SandboxProviderError",
      );
    }
    return {};
  };
  server.io.pocketenv.sandbox.deleteSandbox({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await deleteSandbox(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
