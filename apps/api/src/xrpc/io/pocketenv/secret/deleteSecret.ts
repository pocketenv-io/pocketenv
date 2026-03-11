import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/secret/deleteSecret";
import sandboxSecrets from "schema/sandbox-secrets";

export default function (server: Server, ctx: Context) {
  const deleteSecret = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db
      .delete(sandboxSecrets)
      .where(
        or(
          eq(sandboxSecrets.id, params.id),
          eq(sandboxSecrets.secretId, params.id),
        ),
      );

    return {};
  };
  server.io.pocketenv.secret.deleteSecret({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteSecret(params, auth);
    },
  });
}
