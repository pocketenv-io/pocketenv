import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/deleteSandbox";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const deleteSandbox = async (params: QueryParams, auth: HandlerAuth) => {
    const record = await ctx.db
      .select()
      .from(schema.sandboxes)
      .where(eq(schema.sandboxes.id, params.id))
      .execute()
      .then(([row]) => row);

    if (!record) {
      throw new XRPCError(404, "Sandbox not found", "SandboxNotFound");
    }

    const sandbox =
      record.provider === Providers.CLOUDFLARE
        ? ctx.cfsandbox(record.base!)
        : ctx.sandbox();

    try {
      await sandbox.delete(`/v1/sandboxes/${params.id}`, {
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
