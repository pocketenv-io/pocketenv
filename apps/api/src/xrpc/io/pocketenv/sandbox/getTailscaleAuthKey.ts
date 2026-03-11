import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/getTailscaleAuthKey";
import tailscaleAuthKey from "schema/tailscale-auth-keys";

export default function (server: Server, ctx: Context) {
  const getTailscaleAuthKey = async (
    params: QueryParams,
    auth: HandlerAuth,
  ) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const [result] = await ctx.db
      .select()
      .from(tailscaleAuthKey)
      .where(eq(tailscaleAuthKey.sandboxId, params.id))
      .execute();

    if (!result) {
      throw new XRPCError(404, "Not found");
    }

    return {
      id: result.id,
      authKey: result.redacted,
      createdAt: result.createdAt.toISOString(),
    };
  };
  server.io.pocketenv.sandbox.getTailscaleAuthKey({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getTailscaleAuthKey(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
