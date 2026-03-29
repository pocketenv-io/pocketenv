import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { updateSandbox } from "atproto/sandbox";
import type { Context } from "context";
import { and, eq, or, type ExtractTablesWithRelations } from "drizzle-orm";
import type { Server } from "lexicon";
import {
  isSandboxDetailsPref,
  isSandboxProviderPref,
  type SandboxProviderPref,
} from "lexicon/types/io/pocketenv/sandbox/defs";
import type { HandlerInput } from "lexicon/types/io/pocketenv/sandbox/putPreferences";
import { createAgent } from "lib/agent";
import sandboxes from "schema/sandboxes";
import users from "schema/users";
import { consola } from "consola";
import daytonaAuth from "schema/daytona-auth";
import denoAuth from "schema/deno-auth";
import vercelAuth from "schema/vercel-auth";
import spriteAuth from "schema/sprite-auth";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";

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
      if (isSandboxProviderPref(pref)) {
        try {
          await ctx.db.transaction(async (tx) => {
            await tx
              .update(sandboxes)
              .set({ provider: pref.name })
              .where(
                and(
                  eq(sandboxes.id, input.body.sandboxId),
                  eq(sandboxes.userId, user.id),
                ),
              )
              .execute();
            await saveSandboxProvider(tx, user, input, pref);
          });
        } catch (err) {
          consola.error("Failed to save sandbox provider preferences:", err);
          throw new XRPCError(
            500,
            "Failed to save sandbox provider preferences",
            "SavePreferencesError",
          );
        }
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

const saveSandboxProvider = async (
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  user: { id: string; did: string },
  input: HandlerInput,
  pref: SandboxProviderPref,
) => {
  switch (pref.name) {
    case "daytona":
      await tx
        .insert(daytonaAuth)
        .values({
          userId: user.id,
          sandboxId: input.body.sandboxId,
          apiKey: pref.apiKey!,
          redactedApiKey: pref.redactedApiKey!,
          organizationId: pref.organizationId!,
        })
        .onConflictDoUpdate({
          target: [daytonaAuth.sandboxId, daytonaAuth.userId],
          set: {
            apiKey: pref.apiKey!,
            redactedApiKey: pref.redactedApiKey!,
          },
        })
        .execute();
      break;
    case "deno":
      await tx
        .insert(denoAuth)
        .values({
          userId: user.id,
          sandboxId: input.body.sandboxId,
          deployToken: pref.apiKey!,
          redactedDenoToken: pref.redactedApiKey!,
        })
        .onConflictDoUpdate({
          target: [denoAuth.sandboxId, denoAuth.userId],
          set: {
            deployToken: pref.apiKey!,
            redactedDenoToken: pref.redactedApiKey!,
          },
        })
        .execute();
      break;
    case "vercel":
      await tx
        .insert(vercelAuth)
        .values({
          userId: user.id,
          sandboxId: input.body.sandboxId,
          vercelToken: pref.apiKey!,
          redactedVercelToken: pref.redactedApiKey!,
        })
        .onConflictDoUpdate({
          target: [vercelAuth.sandboxId, vercelAuth.userId],
          set: {
            vercelToken: pref.apiKey!,
            redactedVercelToken: pref.redactedApiKey!,
          },
        })
        .execute();
      break;
    case "sprites":
      await tx
        .insert(spriteAuth)
        .values({
          userId: user.id,
          sandboxId: input.body.sandboxId,
          spriteToken: pref.apiKey!,
          redactedSpriteToken: pref.redactedApiKey!,
        })
        .onConflictDoUpdate({
          target: [spriteAuth.sandboxId, spriteAuth.userId],
          set: {
            spriteToken: pref.apiKey!,
            redactedSpriteToken: pref.redactedApiKey!,
          },
        })
        .execute();
      break;
    case "cloudflare": {
      const [record] = await tx
        .select()
        .from(sandboxes)
        .where(
          and(
            or(
              eq(sandboxes.id, input.body.sandboxId),
              eq(sandboxes.name, input.body.sandboxId),
              eq(sandboxes.uri, input.body.sandboxId),
            ),
            eq(sandboxes.userId, user.id),
          ),
        )
        .execute();
      await Promise.all([
        tx
          .delete(daytonaAuth)
          .where(
            and(
              eq(daytonaAuth.userId, user.id),
              eq(daytonaAuth.sandboxId, record!.id),
            ),
          )
          .execute(),
        tx
          .delete(denoAuth)
          .where(
            and(
              eq(denoAuth.userId, user.id),
              eq(denoAuth.sandboxId, record!.id),
            ),
          )
          .execute(),
        tx
          .delete(vercelAuth)
          .where(
            and(
              eq(vercelAuth.userId, user.id),
              eq(vercelAuth.sandboxId, record!.id),
            ),
          )
          .execute(),
        tx
          .delete(spriteAuth)
          .where(
            and(
              eq(spriteAuth.userId, user.id),
              eq(spriteAuth.sandboxId, record!.id),
            ),
          )
          .execute(),
      ]);
      break;
    }
    default:
      break;
  }
};
