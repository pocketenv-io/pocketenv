import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
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
import { count, eq, desc, or, and } from "drizzle-orm";

export default function (server: Server, ctx: Context) {
  const getActorSandboxes = (params: QueryParams, auth: HandlerAuth) =>
    pipe(
      { params, ctx },
      retrieve,
      Effect.flatMap(presentation),
      Effect.retry({ times: 3 }),
      Effect.timeout("10 seconds"),
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
            and(
              or(
                eq(schema.users.did, params.did),
                eq(schema.users.handle, params.did),
              ),
              ...(params.isRunning !== undefined
                ? [
                    eq(
                      schema.sandboxes.status,
                      params.isRunning ? "RUNNING" : "STOPPED",
                    ),
                  ]
                : []),
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
            and(
              or(
                eq(schema.users.did, params.did),
                eq(schema.users.handle, params.did),
              ),
              ...(params.isRunning !== undefined
                ? [
                    eq(
                      schema.sandboxes.status,
                      params.isRunning ? "RUNNING" : "STOPPED",
                    ),
                  ]
                : []),
            ),
          )
          .execute()
          .then((result) => result[0]?.count ?? 0),
      ]),
    catch: (error) => {
      consola.error("Error retrieving sandboxes:", error);
      return new XRPCError(
        500,
        `Failed to retrieve sandboxes: ${error instanceof Error ? error.message : String(error)}`,
      );
    },
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
      provider: sandbox.provider,
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
      startedAt: sandbox.startedAt?.toISOString(),
    })),
    total,
  }));
};
