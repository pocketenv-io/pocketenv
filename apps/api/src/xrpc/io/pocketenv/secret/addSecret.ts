import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/secret/addSecret";
import sandboxSecrets from "schema/sandbox-secrets";
import secrets from "schema/secrets";

export default function (server: Server, ctx: Context) {
  const addSecret = async (input: HandlerInput, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.transaction(async (tx) => {
      const [secret] = await tx
        .insert(secrets)
        .values({
          name: input.body.secret.name,
          value: input.body.secret.value,
          redacted: input.body.redacted,
        })
        .returning()
        .execute();

      if (!secret) {
        throw new XRPCError(500, "Failed to add secret");
      }

      if (!input.body.secret.sandboxId) {
        return;
      }

      await tx
        .insert(sandboxSecrets)
        .values({
          secretId: secret.id,
          sandboxId: input.body.secret.sandboxId,
          name: input.body.secret.name,
        })
        .returning()
        .execute();
    });
    return {};
  };
  server.io.pocketenv.secret.addSecret({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await addSecret(input, auth);
    },
  });
}
