import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/volume/addVolume";
import sandboxVolumes from "schema/sandbox-volumes";
import volumes from "schema/volumes";
import {
  adjectives,
  generateUniqueAsync,
  nouns,
} from "unique-username-generator";

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

      await tx
        .insert(sandboxVolumes)
        .values({
          volumeId: volume.id,
          sandboxId: input.body.volume.sandboxId,
          path: input.body.volume.path,
        })
        .execute();
    });

    return {};
  };
  server.io.pocketenv.volume.addVolume({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await addVolume(input, auth);
    },
  });
}
