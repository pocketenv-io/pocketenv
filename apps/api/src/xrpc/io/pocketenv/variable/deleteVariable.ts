import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/variable/deleteVariable";
import sandboxVariables from "schema/sandbox-variables";

export default function (server: Server, ctx: Context) {
  const deleteVariable = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db
      .delete(sandboxVariables)
      .where(
        or(
          eq(sandboxVariables.id, params.id),
          eq(sandboxVariables.variableId, params.id),
        ),
      );

    return {};
  };
  server.io.pocketenv.variable.deleteVariable({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteVariable(params, auth);
    },
  });
}
