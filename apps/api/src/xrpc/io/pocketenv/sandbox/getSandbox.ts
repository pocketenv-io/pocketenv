import type { HandlerAuth } from "@atproto/xrpc-server";
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
}): Effect.Effect<SelectSandbox | undefined, Error> => {
  return Effect.tryPromise({
    try: async () =>
      ctx.db
        .select()
        .from(schema.sandboxes)
        .where(
          or(
            eq(schema.sandboxes.id, params.id),
            eq(schema.sandboxes.uri, params.id),
          ),
        )
        .execute()
        .then(([row]) => row),
    catch: (error) =>
      new Error(
        `Failed to retrieve sandbox: ${error instanceof Error ? error.message : String(error)}`,
      ),
  });
};

const presentation = (
  sandbox: SelectSandbox | undefined,
): Effect.Effect<OutputSchema, never> => {
  return Effect.sync(() => ({
    sandbox: sandbox && {
      id: sandbox.id,
      name: sandbox.name,
      displayName: sandbox.displayName,
      description: sandbox.description!,
      logo: sandbox.logo!,
      readme: sandbox.readme!,
      installs: sandbox.installs,
      uri: sandbox.uri,
      createdAt: sandbox.createdAt.toISOString(),
    },
  }));
};
