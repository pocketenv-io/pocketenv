import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/variable/addVariable";
import sandboxVariables from "schema/sandbox-variables";
import variables from "schema/variables";

export default function (server: Server, ctx: Context) {
  const addVariable = async (input: HandlerInput, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.transaction(async (tx) => {
      const [variable] = await tx
        .insert(variables)
        .values({
          name: input.body.variable.name,
          value: input.body.variable.value,
        })
        .returning()
        .execute();

      if (!variable) {
        throw new XRPCError(500, "Failed to add variable");
      }

      if (!input.body.variable.sandboxId) {
        return;
      }

      await tx
        .insert(sandboxVariables)
        .values({
          sandboxId: input.body.variable.sandboxId,
          variableId: variable.id,
          name: input.body.variable.name,
        })
        .execute();
    });
  };
  server.io.pocketenv.variable.addVariable({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await addVariable(input, auth);
    },
  });
}
