import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { updateSandbox } from "atproto/sandbox";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/secret/updateSecret";
import sandboxSecrets from "schema/sandbox-secrets";
import sandboxes from "schema/sandboxes";
import secrets from "schema/secrets";
import { consola } from "consola";
import { createAgent } from "lib/agent";

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

    if (input.body.secret.sandboxId) {
      const agent = await createAgent(ctx.oauthClient, auth.credentials.did);
      if (!agent) {
        consola.error(
          "Failed to create AT Protocol agent for DID:",
          auth.credentials.did,
        );
        throw new XRPCError(
          500,
          "Failed to create AT Protocol agent",
          "AgentCreationError",
        );
      }
      ctx.db
        .select()
        .from(sandboxSecrets)
        .leftJoin(sandboxes, eq(sandboxSecrets.sandboxId, sandboxes.id))
        .where(eq(sandboxSecrets.sandboxId, input.body.secret.sandboxId))
        .execute()
        .then((records) => {
          const uri = records[0]?.sandboxes?.uri;
          if (uri) {
            return updateSandbox(agent, {
              rkey: uri.split("/").pop()!,
              secrets: records.map((r) => r.sandbox_secrets.name!),
            });
          }
        })
        .catch((err) => {
          consola.error("Failed to update sandbox after adding secret:", err);
        });
    }

    return {};
  };
  server.io.pocketenv.secret.updateSecret({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await updateSecret(input, auth);
    },
  });
}
