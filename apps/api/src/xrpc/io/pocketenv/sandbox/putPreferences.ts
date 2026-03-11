import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { and, eq } from "drizzle-orm";
import type { Server } from "lexicon";
import { isSandboxDetailsPref } from "lexicon/types/io/pocketenv/sandbox/defs";
import type { HandlerInput } from "lexicon/types/io/pocketenv/sandbox/putPreferences";
import sandboxes from "schema/sandboxes";
import users from "schema/users";

export default function (server: Server, ctx: Context) {
  const putPreferences = async (input: HandlerInput, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.did, auth.credentials.did))
      .execute();

    if (!user) {
      throw new XRPCError(404, "User not found");
    }

    for (const pref of input.body.preferences) {
      if (isSandboxDetailsPref(pref)) {
        await ctx.db
          .update(sandboxes)
          .set({
            name: pref.name,
            description: pref.description,
            topics: pref.topics,
            repo: pref.repo,
          })
          .where(
            and(
              eq(sandboxes.id, input.body.sandboxId),
              eq(sandboxes.userId, user.id),
            ),
          )
          .execute();
      }
    }
    return {};
  };
  server.io.pocketenv.sandbox.putPreferences({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await putPreferences(input, auth);
    },
  });
}
