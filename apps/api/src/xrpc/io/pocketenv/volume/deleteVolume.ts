import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { updateSandbox } from "atproto/sandbox";
import type { Context } from "context";
import { eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/volume/deleteVolume";
import sandboxVolumes from "schema/sandbox-volumes";
import sandboxes from "schema/sandboxes";
import { consola } from "consola";
import { createAgent } from "lib/agent";

export default function (server: Server, ctx: Context) {
  const deleteVolume = async (params: QueryParams, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const [volume] = await ctx.db
      .delete(sandboxVolumes)
      .where(
        or(
          eq(sandboxVolumes.id, params.id),
          eq(sandboxVolumes.volumeId, params.id),
        ),
      )
      .returning()
      .execute();

    if (!volume) {
      return {};
    }

    if (volume) {
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
        .where(eq(sandboxVolumes.sandboxId, volume.sandboxId))
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
  server.io.pocketenv.volume.deleteVolume({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      await deleteVolume(params, auth);
    },
  });
}
