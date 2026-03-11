import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { InputSchema } from "lexicon/types/io/pocketenv/sandbox/putTailscaleAuthKey";
import tailscaleAuthKeys from "schema/tailscale-auth-keys";

export default function (server: Server, ctx: Context) {
  const putTailscaleAuthKey = async (input: InputSchema, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.transaction(async (tx) => {
      await tx
        .delete(tailscaleAuthKeys)
        .where(eq(tailscaleAuthKeys.sandboxId, input.id))
        .execute();
      await tx
        .insert(tailscaleAuthKeys)
        .values({
          sandboxId: input.id,
          authKey: input.authKey,
          redacted: input.redacted || "",
        })
        .execute();
    });

    return {};
  };
  server.io.pocketenv.sandbox.putTailscaleAuthKey({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      const result = await putTailscaleAuthKey(input.body, auth);
      return {
        encoding: "application/json",
        body: result as any, // TODO: Implement createIntegration
      };
    },
  });
}
