import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/variable/updateVariable";
import sandboxVariables from "schema/sandbox-variables";
import variables from "schema/variables";

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

    return {};
  };
  server.io.pocketenv.variable.updateVariable({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await updateVariable(input, auth);
    },
  });
}
