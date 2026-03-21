import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { updateSandbox } from "atproto/sandbox";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/secret/deleteSecret";
import sandboxSecrets from "schema/sandbox-secrets";
import sandboxes from "schema/sandboxes";
import { consola } from "consola";
import { createAgent } from "lib/agent";
import secrets from "schema/secrets";
import users from "schema/users";

export default function (server: Server, ctx: Context) {
  const deleteSecret = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const [existingSecret] = await ctx.db
      .select()
      .from(sandboxSecrets)
      .leftJoin(secrets, eq(sandboxSecrets.secretId, secrets.id))
      .leftJoin(sandboxes, eq(sandboxSecrets.sandboxId, sandboxes.id))
      .leftJoin(users, eq(sandboxes.userId, users.id))
      .where(
        and(
          or(
            eq(sandboxSecrets.id, params.id),
            eq(sandboxSecrets.secretId, params.id),
          ),
          eq(users.did, auth.credentials.did),
        ),
      )
      .execute();

    if (!existingSecret) {
      throw new XRPCError(404, "Secret not found");
    }

    const [secret] = await ctx.db
      .delete(sandboxSecrets)
      .where(
        or(
          eq(sandboxSecrets.id, params.id),
          eq(sandboxSecrets.secretId, params.id),
        ),
      )
      .returning()
      .execute();

    if (secret) {
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
        .where(eq(sandboxSecrets.sandboxId, secret.sandboxId))
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
  server.io.pocketenv.secret.deleteSecret({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteSecret(params, auth);
    },
  });
}
