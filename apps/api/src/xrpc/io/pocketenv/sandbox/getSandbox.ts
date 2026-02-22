import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type {
  OutputSchema,
  QueryParams,
} from "lexicon/types/io/pocketenv/sandbox/getSandbox";
import type { SelectSandbox } from "schema/sandboxes";
import { Effect, pipe } from "effect";
import schema from "schema";
import { eq, or } from "drizzle-orm";
import { consola } from "consola";
import type { SelectUser } from "schema/users";

export default function (server: Server, ctx: Context) {
  const getSandbox = (params: QueryParams, auth: HandlerAuth) =>
    pipe(
      { params, ctx },
      retrieve,
      Effect.flatMap(presentation),
      Effect.retry({ times: 3 }),
      Effect.timeout("10 seconds"),
      Effect.catchAll((err) => {
        consola.error("Error retrieving sandboxes:", err);
        return Effect.succeed({ sandbox: null });
      }),
    );
  server.io.pocketenv.sandbox.getSandbox({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await Effect.runPromise(getSandbox(params, auth));
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
}): Effect.Effect<
  { sandboxes: SelectSandbox; users: SelectUser | null } | undefined,
  Error
> => {
  return Effect.tryPromise({
    try: async () =>
      ctx.db
        .select()
        .from(schema.sandboxes)
        .leftJoin(schema.users, eq(schema.sandboxes.userId, schema.users.id))
        .where(
          or(
            eq(schema.sandboxes.id, params.id),
            eq(schema.sandboxes.uri, params.id),
          ),
        )
        .execute()
        .then(([row]) => row),
    catch: (error) =>
      new XRPCError(
        500,
        `Failed to retrieve sandbox: ${error instanceof Error ? error.message : String(error)}`,
      ),
  });
};

const presentation = (
  data: { sandboxes: SelectSandbox; users: SelectUser | null } | undefined,
): Effect.Effect<OutputSchema, never> => {
  return Effect.sync(() => ({
    sandbox: data?.sandboxes && {
      id: data.sandboxes.id,
      name: data.sandboxes.name,
      provider: data.sandboxes.provider,
      displayName: data.sandboxes.displayName,
      description: data.sandboxes.description,
      baseSandbox: data.sandboxes.base,
      status: data.sandboxes.status,
      repo: data.sandboxes.repo,
      logo: data.sandboxes.logo,
      readme: data.sandboxes.readme,
      installs: data.sandboxes.installs,
      uri: data.sandboxes.uri,
      vcpus: data.sandboxes.vcpus,
      memory: data.sandboxes.memory,
      disk: data.sandboxes.disk,
      createdAt: data.sandboxes.createdAt.toISOString(),
      startedAt: data.sandboxes.startedAt?.toISOString(),
      ...(data.users && {
        owner: {
          ...data.users,
          createdAt: data.users.createdAt.toISOString(),
          updatedAt: data.users.updatedAt.toISOString(),
        },
      }),
    },
  }));
};
