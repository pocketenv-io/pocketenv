import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/secret/updateSecret";
import sandboxSecrets from "schema/sandbox-secrets";
import secrets from "schema/secrets";

export default function (server: Server, ctx: Context) {
  const updateSecret = async (input: HandlerInput, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.transaction(async (tx) => {
      const [secret] = await tx
        .update(secrets)
        .set({
          name: input.body.secret.name,
          value: input.body.secret.value,
          redacted: input.body.redacted,
        })
        .where(eq(secrets.id, input.body.id))
        .returning()
        .execute();

      if (!secret) {
        throw new XRPCError(404, "Secret not found");
      }

      await tx
        .update(sandboxSecrets)
        .set({ name: input.body.secret.name, updatedAt: new Date() })
        .where(eq(sandboxSecrets.secretId, secret.id))
        .execute();
    });

    return {};
  };
  server.io.pocketenv.secret.updateSecret({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await updateSecret(input, auth);
    },
  });
}
