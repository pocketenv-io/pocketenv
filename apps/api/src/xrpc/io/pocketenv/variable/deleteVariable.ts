import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { updateSandbox } from "atproto/sandbox";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/variable/deleteVariable";
import sandboxVariables from "schema/sandbox-variables";
import sandboxes from "schema/sandboxes";
import { consola } from "consola";
import { createAgent } from "lib/agent";
import users from "schema/users";

export default function (server: Server, ctx: Context) {
  const deleteVariable = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const [existingVariable] = await ctx.db
      .select()
      .from(sandboxVariables)
      .leftJoin(sandboxes, eq(sandboxVariables.sandboxId, sandboxes.id))
      .leftJoin(users, eq(sandboxes.userId, users.id))
      .where(
        and(
          or(
            eq(sandboxVariables.id, params.id),
            eq(sandboxVariables.variableId, params.id),
          ),
          eq(users.did, auth.credentials.did),
        ),
      )
      .execute();

    if (!existingVariable) {
      throw new XRPCError(404, "Variable not found");
    }

    const [variable] = await ctx.db
      .delete(sandboxVariables)
      .where(
        or(
          eq(sandboxVariables.id, params.id),
          eq(sandboxVariables.variableId, params.id),
        ),
      )
      .returning()
      .execute();

    if (variable) {
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
        .from(sandboxVariables)
        .leftJoin(sandboxes, eq(sandboxVariables.sandboxId, sandboxes.id))
        .where(eq(sandboxVariables.sandboxId, variable.sandboxId))
        .execute()
        .then((records) => {
          const uri = records[0]?.sandboxes?.uri;
          if (uri) {
            return updateSandbox(agent, {
              rkey: uri.split("/").pop()!,
              envs: records.map((r) => r.sandbox_variables.name!),
            });
          }
        })
        .catch((err) => {
          consola.error("Failed to update sandbox after adding variable:", err);
        });
    }

    return {};
  };
  server.io.pocketenv.variable.deleteVariable({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteVariable(params, auth);
    },
  });
}
