import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { SandboxProviderPref } from "lexicon/types/io/pocketenv/sandbox/defs";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/sandbox/getPreferences";
import daytonaAuth from "schema/daytona-auth";
import denoAuth from "schema/deno-auth";
import sandboxes from "schema/sandboxes";
import spriteAuth from "schema/sprite-auth";
import users from "schema/users";
import vercelAuth from "schema/vercel-auth";

export default function (server: Server, ctx: Context) {
  const getPreferences = async (params: QueryParams, auth: HandlerAuth) => {
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

    const sandboxFilter = or(
      eq(sandboxes.id, params.id),
      eq(sandboxes.uri, params.id),
      eq(sandboxes.name, params.id),
    );

    const [daytona, deno, sprite, vercel] = await Promise.all([
      ctx.db
        .select()
        .from(daytonaAuth)
        .leftJoin(sandboxes, eq(daytonaAuth.sandboxId, sandboxes.id))
        .where(and(eq(daytonaAuth.userId, user.id), sandboxFilter))
        .execute()
        .then(([row]) => row?.daytona_auth),
      ctx.db
        .select()
        .from(denoAuth)
        .leftJoin(sandboxes, eq(denoAuth.sandboxId, sandboxes.id))
        .where(and(eq(denoAuth.userId, user.id), sandboxFilter))
        .execute()
        .then(([row]) => row?.deno_auth),
      ctx.db
        .select()
        .from(spriteAuth)
        .leftJoin(sandboxes, eq(spriteAuth.sandboxId, sandboxes.id))
        .where(and(eq(spriteAuth.userId, user.id), sandboxFilter))
        .execute()
        .then(([row]) => row?.sprite_auth),
      ctx.db
        .select()
        .from(vercelAuth)
        .leftJoin(sandboxes, eq(vercelAuth.sandboxId, sandboxes.id))
        .where(and(eq(vercelAuth.userId, user.id), sandboxFilter))
        .execute()
        .then(([row]) => row?.vercel_auth),
    ]);
    console.log(daytona, deno, sprite, vercel);

    if (!daytona && !deno && !sprite && !vercel) {
      return [];
    }

    const provider = ((daytona && {
      $type: "io.pocketenv.sandbox.defs#sandboxProviderPref" as const,
      name: "daytona" as const,
      redactedApiKey: daytona.redactedApiKey,
    }) ||
      (deno && {
        $type: "io.pocketenv.sandbox.defs#sandboxProviderPref" as const,
        name: "deno" as const,
        redactedApiKey: deno.redactedDenoToken,
      }) ||
      (sprite && {
        $type: "io.pocketenv.sandbox.defs#sandboxProviderPref" as const,
        name: "sprites" as const,
        redactedApiKey: sprite.redactedSpriteToken,
      }) ||
      (vercel && {
        $type: "io.pocketenv.sandbox.defs#sandboxProviderPref" as const,
        name: "vercel" as const,
        redactedApiKey: vercel.redactedVercelToken,
      }))!;

    return [provider satisfies SandboxProviderPref];
  };
  server.io.pocketenv.sandbox.getPreferences({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await getPreferences(params, auth);
      return {
        encoding: "application/json",
        body: result satisfies OutputSchema,
      };
    },
  });
}
