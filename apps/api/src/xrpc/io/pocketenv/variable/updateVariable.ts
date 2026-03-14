import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/variable/updateVariable";
import sandboxVariables from "schema/sandbox-variables";
import sandboxes from "schema/sandboxes";
import variables from "schema/variables";
import { updateSandbox } from "atproto/sandbox";
import { consola } from "consola";
import { createAgent } from "lib/agent";

export default function (server: Server, ctx: Context) {
  const updateVariable = async (input: HandlerInput, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.transaction(async (tx) => {
      const [variable] = await tx
        .update(variables)
        .set({
          name: input.body.variable.name,
          value: input.body.variable.value,
          updatedAt: new Date(),
        })
        .where(eq(variables.id, input.body.id))
        .returning()
        .execute();

      if (!variable) {
        throw new XRPCError(404, "Variable not found");
      }

      await tx
        .update(sandboxVariables)
        .set({ name: input.body.variable.name, updatedAt: new Date() })
        .where(eq(sandboxVariables.variableId, variable.id))
        .execute();
    });

    if (input.body.variable.sandboxId) {
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
        .where(eq(sandboxVariables.sandboxId, input.body.variable.sandboxId))
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
  server.io.pocketenv.variable.updateVariable({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await updateVariable(input, auth);
    },
  });
}
