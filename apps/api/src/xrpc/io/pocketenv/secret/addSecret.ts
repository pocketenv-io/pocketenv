import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/secret/addSecret";
import sandboxSecrets from "schema/sandbox-secrets";
import secrets from "schema/secrets";
import sandboxes from "schema/sandboxes";
import { updateSandbox } from "atproto/sandbox";
import { consola } from "consola";
import { createAgent } from "lib/agent";

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
  server.io.pocketenv.secret.addSecret({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await addSecret(input, auth);
    },
  });
}
