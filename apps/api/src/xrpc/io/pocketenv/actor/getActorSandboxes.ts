import type { HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import { Effect, pipe } from "effect";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/actor/getActorSandboxes";
import type { SelectSandbox } from "schema/sandboxes";
import { consola } from "consola";
import schema from "schema";
import { count, eq, desc, or } from "drizzle-orm";

export default function (server: Server, ctx: Context) {
  const getActorSandboxes = (params: QueryParams, auth: HandlerAuth) =>
    pipe(
      { params, ctx },
      retrieve,
      Effect.flatMap(presentation),
      Effect.retry({ times: 3 }),
      Effect.timeout("10 seconds"),
      Effect.catchAll((err) => {
        consola.error("Error retrieving sandboxes:", err);
        return Effect.succeed({ sandboxes: [] });
      }),
    );
  server.io.pocketenv.actor.getActorSandboxes({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await Effect.runPromise(getActorSandboxes(params, auth));
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
}: {
  params: QueryParams;
  ctx: Context;
}): Effect.Effect<[SelectSandbox[], number], Error> => {
  return Effect.tryPromise({
    try: async () =>
      Promise.all([
        ctx.db
          .select()
          .from(schema.sandboxes)
          .leftJoin(schema.users, eq(schema.sandboxes.userId, schema.users.id))
          .where(
            or(
              eq(schema.users.did, params.did),
              eq(schema.users.handle, params.did),
            ),
          )
          .orderBy(desc(schema.sandboxes.createdAt))
          .limit(params.limit ?? 30)
          .offset(params.offset ?? 0)
          .execute()
          .then((result) => result.map((row) => row.sandboxes)),
        ctx.db
          .select({ count: count() })
          .from(schema.sandboxes)
          .leftJoin(schema.users, eq(schema.sandboxes.userId, schema.users.id))
          .where(
            or(
              eq(schema.users.did, params.did),
              eq(schema.users.handle, params.did),
            ),
          )
          .execute()
          .then((result) => result[0]?.count ?? 0),
      ]),
    catch: (error) =>
      new Error(
        `Failed to retrieve sandboxes: ${error instanceof Error ? error.message : String(error)}`,
      ),
  });
};

const presentation = ([sandboxes, total]: [
  SelectSandbox[],
  number,
]): Effect.Effect<OutputSchema, never> => {
  return Effect.sync(() => ({
    sandboxes: sandboxes.map((sandbox) => ({
      id: sandbox.id,
      name: sandbox.name,
      baseSandbox: sandbox.base as string,
      displayName: sandbox.displayName,
      description: sandbox.description!,
      logo: sandbox.logo!,
      readme: sandbox.readme!,
      status: sandbox.status,
      installs: sandbox.installs,
      uri: sandbox.uri,
      vcpus: sandbox.vcpus as number,
      memory: sandbox.memory as number,
      disk: sandbox.disk as number,
      createdAt: sandbox.createdAt.toISOString(),
    })),
    total,
  }));
};
