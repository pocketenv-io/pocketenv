import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/volume/addVolume";
import sandboxVolumes from "schema/sandbox-volumes";
import sandboxes from "schema/sandboxes";
import volumes from "schema/volumes";
import { updateSandbox } from "atproto/sandbox";
import {
  adjectives,
  generateUniqueAsync,
  nouns,
} from "unique-username-generator";
import { consola } from "consola";
import { createAgent } from "lib/agent";
import users from "schema/users";

export default function (server: Server, ctx: Context) {
  const addVolume = async (input: HandlerInput, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    let slug, suffix, existing;
    do {
      slug = await generateUniqueAsync(
        { dictionaries: [adjectives, nouns], separator: "-" },
        () => false,
      );

      suffix = Math.random().toString(36).substring(2, 6);
      slug = `${slug}-${suffix}`;

      existing = await ctx.db
        .select()
        .from(volumes)
        .where(eq(volumes.slug, slug))
        .execute();
      if (existing.length === 0) {
        break;
      }
    } while (true);

    await ctx.db.transaction(async (tx) => {
      const [volume] = await tx
        .insert(volumes)
        .values({
          slug,
          size: 20,
          sizeUnit: "GB",
        })
        .returning()
        .execute();

      if (!volume?.id) {
        throw new XRPCError(500, "Failed to create volume");
      }

      if (!input.body.volume.sandboxId || !input.body.volume.path) {
        return;
      }

      if (input.body.volume.sandboxId) {
        const [sandbox] = await tx
          .select()
          .from(sandboxes)
          .leftJoin(users, eq(sandboxes.userId, users.id))
          .where(
            and(
              eq(users.did, auth.credentials.did),
              or(
                eq(sandboxes.id, input.body.volume.sandboxId),
                eq(sandboxes.name, input.body.volume.sandboxId),
              ),
            ),
          )
          .execute();

        if (!sandbox) {
          throw new XRPCError(404, "Sandbox not found");
        }

        await tx
          .insert(sandboxVolumes)
          .values({
            volumeId: volume.id,
            sandboxId: sandbox.sandboxes.id,
            path: input.body.volume.path,
            name: input.body.volume.name,
          })
          .execute();
      }
    });

    if (input.body.volume.sandboxId) {
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
        .from(sandboxVolumes)
        .leftJoin(sandboxes, eq(sandboxVolumes.sandboxId, sandboxes.id))
        .where(eq(sandboxVolumes.sandboxId, input.body.volume.sandboxId))
        .execute()
        .then((records) => {
          const uri = records[0]?.sandboxes?.uri;
          if (uri) {
            return updateSandbox(agent, {
              rkey: uri.split("/").pop()!,
              volumes: records.map((r) => r.sandbox_volumes.path!),
            });
          }
        })
        .catch((err) => {
          consola.error("Failed to update sandbox after adding volume:", err);
        });
    }

    return {};
  };
  server.io.pocketenv.volume.addVolume({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await addVolume(input, auth);
    },
  });
}
