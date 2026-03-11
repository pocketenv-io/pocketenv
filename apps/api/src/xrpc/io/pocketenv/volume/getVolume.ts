import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq, and, count } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/volume/getVolume";
import volumes, { type SelectVolume } from "schema/volumes";
import sandboxVolumes, {
  type SelectSandboxVolume,
} from "schema/sandbox-volumes";
import sandboxes from "schema/sandboxes";
import users from "schema/users";
import { pipe, Effect } from "effect";
import { consola } from "consola";

export default function (server: Server, ctx: Context) {
  const getVolume = (params: QueryParams, auth: HandlerAuth) => {
    if (!auth?.credentials?.did) {
      throw new XRPCError(401, "Unauthorized");
    }

    return pipe(
      { params, ctx, auth },
      retrieve,
      Effect.flatMap(presentation),
      Effect.retry({ times: 3 }),
      Effect.timeout("10 seconds"),
      Effect.catchAll((err) => {
        consola.error("Error retrieving volume:", err);
        return Effect.succeed({ volumes: [] });
      }),
    );
  };

  server.io.pocketenv.volume.getVolume({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await Effect.runPromise(getVolume(params, auth));
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}

const retrieve = ({
  params,
  ctx,
  auth,
}: {
  params: QueryParams;
  ctx: Context;
  auth: HandlerAuth;
}): Effect.Effect<SelectSandboxVolume[], Error> => {
  return Effect.tryPromise({
    try: async () =>
      ctx.db
        .select()
        .from(sandboxVolumes)
        .leftJoin(sandboxes, eq(sandboxes.id, sandboxVolumes.sandboxId))
        .leftJoin(volumes, eq(volumes.id, sandboxVolumes.volumeId))
        .leftJoin(users, eq(users.id, sandboxes.userId))
        .where(
          and(
            eq(users.did, auth.credentials.did),
            eq(sandboxVolumes.id, params.id),
          ),
        )
        .execute()
        .then((rows) =>
          rows
            .map((row) => row.sandbox_volumes)
            .filter((volume) => volume !== null),
        ),
    catch: (error) => {
      consola.error("Error retrieving volume:", error);
      throw new XRPCError(
        500,
        `Failed to retrieve volume: ${error instanceof Error ? error.message : String(error)}`,
      );
    },
  });
};

const presentation = (
  volumes: SelectSandboxVolume[],
): Effect.Effect<OutputSchema, never> => {
  return Effect.sync(() => ({
    volume: volumes.map((volume, index) => ({
      id: volume.id,
      name: volume.name || "",
      path: volume.path,
      createdAt: volume.createdAt.toISOString(),
      updatedAt: volume.updatedAt.toISOString(),
    }))[0],
  }));
};
