import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq, and, count } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/variable/getVariables";
import sandboxes from "schema/sandboxes";
import users from "schema/users";
import { pipe, Effect } from "effect";
import { consola } from "consola";
import variables, { type SelectVariable } from "schema/variables";
import sandboxVariables from "schema/sandbox-variables";

export default function (server: Server, ctx: Context) {
  const getVariables = (params: QueryParams, auth: HandlerAuth) => {
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
        consola.error("Error retrieving variables:", err);
        return Effect.succeed({ sandboxes: [] });
      }),
    );
  };

  server.io.pocketenv.variable.getVariables({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await Effect.runPromise(getVariables(params, auth));
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
}): Effect.Effect<[SelectVariable[], number], Error> => {
  return Effect.tryPromise({
    try: async () =>
      Promise.all([
        ctx.db
          .select()
          .from(sandboxVariables)
          .leftJoin(sandboxes, eq(sandboxes.id, sandboxVariables.sandboxId))
          .leftJoin(variables, eq(variables.id, sandboxVariables.variableId))
          .leftJoin(users, eq(users.id, sandboxes.userId))
          .where(
            params.sandboxId
              ? and(
                  eq(users.did, auth.credentials.did),
                  eq(sandboxVariables.sandboxId, params.sandboxId),
                )
              : eq(users.did, auth.credentials.did),
          )
          .offset(params.offset ?? 0)
          .limit(params.limit ?? 20)
          .execute()
          .then((rows) =>
            rows
              .map((row) => row.variables)
              .filter((variable) => variable !== null),
          ),
        ctx.db
          .select({
            count: count(),
          })
          .from(sandboxVariables)
          .leftJoin(sandboxes, eq(sandboxes.id, sandboxVariables.sandboxId))
          .leftJoin(users, eq(users.id, sandboxes.userId))
          .where(
            params.sandboxId
              ? and(
                  eq(users.did, auth.credentials.did),
                  eq(sandboxVariables.sandboxId, params.sandboxId),
                )
              : eq(users.did, auth.credentials.did),
          )
          .execute()
          .then((result) => result[0]?.count ?? 0),
      ]),
    catch: (error) => {
      consola.error("Error retrieving variables:", error);
      throw new XRPCError(
        500,
        `Failed to retrieve variables: ${error instanceof Error ? error.message : String(error)}`,
      );
    },
  });
};

const presentation = ([variables, total]: [
  SelectVariable[],
  number,
]): Effect.Effect<OutputSchema, never> => {
  return Effect.sync(() => ({
    variables: variables.map((variable) => ({
      id: variable.id,
      name: variable.name,
      value: variable.value,
      createdAt: variable.createdAt.toISOString(),
      updatedAt: variable.updatedAt.toISOString(),
    })),
    total,
  }));
};
