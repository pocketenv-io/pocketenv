import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { updateSandbox } from "atproto/sandbox";
import type { Context } from "context";
import { and, eq } from "drizzle-orm";
import type { Server } from "lexicon";
import { isSandboxDetailsPref } from "lexicon/types/io/pocketenv/sandbox/defs";
import type { HandlerInput } from "lexicon/types/io/pocketenv/sandbox/putPreferences";
import { createAgent } from "lib/agent";
import sandboxes from "schema/sandboxes";
import users from "schema/users";
import { consola } from "consola";

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

    for (const pref of input.body.preferences) {
      if (isSandboxDetailsPref(pref)) {
        await ctx.db
          .update(sandboxes)
          .set({
            name: pref.name,
            description: pref.description,
            topics: pref.topics as string[],
            repo: pref.repo,
          })
          .where(
            and(
              eq(sandboxes.id, input.body.sandboxId),
              eq(sandboxes.userId, user.id),
            ),
          )
          .returning()
          .execute()
          .then(
            ([record]) =>
              record &&
              updateSandbox(agent, {
                rkey: record?.uri?.split("/").pop()!,
                name: pref.name,
                description: pref.description,
                topics: pref.topics as string[],
                repo: pref.repo,
              }),
          );
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
