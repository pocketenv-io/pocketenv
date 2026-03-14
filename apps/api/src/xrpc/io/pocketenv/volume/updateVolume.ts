import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { updateSandbox } from "atproto/sandbox";
import type { Context } from "context";
import { and, eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/volume/updateVolume";
import sandboxVolumes from "schema/sandbox-volumes";
import sandboxes from "schema/sandboxes";
import users from "schema/users";
import { consola } from "consola";
import { createAgent } from "lib/agent";

export default function (server: Server, ctx: Context) {
  const updateVolume = async (input: HandlerInput, auth: HandlerAuth) => {
    if (!auth?.credentials?.did) {
      throw new XRPCError(401, "Unauthorized");
    }

    const { id, volume } = input.body;

    await ctx.db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: sandboxVolumes.id })
        .from(sandboxVolumes)
        .leftJoin(sandboxes, eq(sandboxes.id, sandboxVolumes.sandboxId))
        .leftJoin(users, eq(users.id, sandboxes.userId))
        .where(
          and(eq(sandboxVolumes.id, id), eq(users.did, auth.credentials.did)),
        )
        .execute();

      if (!existing) {
        throw new XRPCError(404, "Volume not found");
      }

      const updates: Partial<{
        name: string | null;
        path: string;
        updatedAt: Date;
      }> = {
        updatedAt: new Date(),
      };

      if (volume.name !== undefined) {
        updates.name = volume.name;
      }

      if (volume.path !== undefined) {
        updates.path = volume.path;
      }

      await tx
        .update(sandboxVolumes)
        .set(updates)
        .where(eq(sandboxVolumes.id, id))
        .execute();
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

  server.io.pocketenv.volume.updateVolume({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await updateVolume(input, auth);
    },
  });
}
