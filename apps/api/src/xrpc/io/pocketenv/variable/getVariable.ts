import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq, and, count, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/variable/getVariable";
import sandboxes from "schema/sandboxes";
import users from "schema/users";
import { pipe, Effect } from "effect";
import { consola } from "consola";
import variables, { type SelectVariable } from "schema/variables";
import sandboxVariables from "schema/sandbox-variables";

export default function (server: Server, ctx: Context) {
  const getVariable = (params: QueryParams, auth: HandlerAuth) => {
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
        consola.error("Error retrieving variable:", err);
        return Effect.succeed({ variables: [] });
      }),
    );
  };

  server.io.pocketenv.variable.getVariable({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await Effect.runPromise(getVariable(params, auth));
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
}): Effect.Effect<SelectVariable[], Error> => {
  return Effect.tryPromise({
    try: async () =>
      ctx.db
        .select()
        .from(sandboxVariables)
        .leftJoin(sandboxes, eq(sandboxes.id, sandboxVariables.sandboxId))
        .leftJoin(variables, eq(variables.id, sandboxVariables.variableId))
        .leftJoin(users, eq(users.id, sandboxes.userId))
        .where(
          and(
            eq(users.did, auth.credentials.did),
            or(
              eq(sandboxVariables.variableId, params.id),
              eq(variables.name, params.id),
            ),
          ),
        )
        .execute()
        .then((rows) =>
          rows
            .map((row) => row.variables)
            .filter((variable) => variable !== null),
        ),
    catch: (error) => {
      consola.error("Error retrieving variable:", error);
      throw new XRPCError(
        500,
        `Failed to retrieve variable: ${error instanceof Error ? error.message : String(error)}`,
      );
    },
  });
};

const presentation = (
  variables: SelectVariable[],
): Effect.Effect<OutputSchema, never> => {
  return Effect.sync(() => ({
    variable: variables.map((variable) => ({
      id: variable.id,
      name: variable.name,
      value: variable.value,
      createdAt: variable.createdAt.toISOString(),
      updatedAt: variable.updatedAt.toISOString(),
    }))[0],
  }));
};
