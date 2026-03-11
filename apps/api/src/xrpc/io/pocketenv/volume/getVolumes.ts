import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq, and, count } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/volume/getVolumes";
import volumes, { type SelectVolume } from "schema/volumes";
import sandboxVolumes, {
  type SelectSandboxVolume,
} from "schema/sandbox-volumes";
import sandboxes from "schema/sandboxes";
import users from "schema/users";
import { pipe, Effect } from "effect";
import { consola } from "consola";

export default function (server: Server, ctx: Context) {
  const getVolumes = (params: QueryParams, auth: HandlerAuth) => {
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
        consola.error("Error retrieving volumes:", err);
        return Effect.succeed({ volumes: [] });
      }),
    );
  };

  server.io.pocketenv.volume.getVolumes({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await Effect.runPromise(getVolumes(params, auth));
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
}): Effect.Effect<
  [SelectSandboxVolume[], (SelectVolume | null)[], number],
  Error
> => {
  return Effect.tryPromise({
    try: async () =>
      Promise.all([
        ctx.db
          .select()
          .from(sandboxVolumes)
          .leftJoin(sandboxes, eq(sandboxes.id, sandboxVolumes.sandboxId))
          .leftJoin(volumes, eq(volumes.id, sandboxVolumes.volumeId))
          .leftJoin(users, eq(users.id, sandboxes.userId))
          .where(
            params.sandboxId
              ? and(
                  eq(users.did, auth.credentials.did),
                  eq(sandboxVolumes.sandboxId, params.sandboxId),
                )
              : eq(users.did, auth.credentials.did),
          )
          .offset(params.offset ?? 0)
          .limit(params.limit ?? 20)
          .execute()
          .then((rows) =>
            rows
              .map((row) => row.sandbox_volumes)
              .filter((volume) => volume !== null),
          ),
        ctx.db
          .select()
          .from(sandboxVolumes)
          .leftJoin(sandboxes, eq(sandboxes.id, sandboxVolumes.sandboxId))
          .leftJoin(volumes, eq(volumes.id, sandboxVolumes.volumeId))
          .leftJoin(users, eq(users.id, sandboxes.userId))
          .where(
            params.sandboxId
              ? and(
                  eq(users.did, auth.credentials.did),
                  eq(sandboxVolumes.sandboxId, params.sandboxId),
                )
              : eq(users.did, auth.credentials.did),
          )
          .offset(params.offset ?? 0)
          .limit(params.limit ?? 20)
          .execute()
          .then((rows) =>
            rows.map((row) => row.volumes).filter((volume) => volume),
          ),
        ctx.db
          .select({
            count: count(),
          })
          .from(sandboxVolumes)
          .leftJoin(sandboxes, eq(sandboxes.id, sandboxVolumes.sandboxId))
          .leftJoin(volumes, eq(volumes.id, sandboxVolumes.volumeId))
          .leftJoin(users, eq(users.id, sandboxes.userId))
          .where(
            params.sandboxId
              ? and(
                  eq(users.did, auth.credentials.did),
                  eq(sandboxVolumes.sandboxId, params.sandboxId),
                )
              : eq(users.did, auth.credentials.did),
          )
          .execute()
          .then((result) => result[0]?.count ?? 0),
      ]),
    catch: (error) => {
      consola.error("Error retrieving volumes:", error);
      throw new XRPCError(
        500,
        `Failed to retrieve volumes: ${error instanceof Error ? error.message : String(error)}`,
      );
    },
  });
};

const presentation = ([volumes, , total]: [
  SelectSandboxVolume[],
  (SelectVolume | null)[],
  number,
]): Effect.Effect<OutputSchema, never> => {
  return Effect.sync(() => ({
    volumes: volumes.map((volume) => ({
      id: volume.id,
      name: volume.name!,
      path: volume.path,
      createdAt: volume.createdAt.toISOString(),
      updatedAt: volume.updatedAt.toISOString(),
    })),
    total,
  }));
};
