import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq, and, count } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/secret/getSecrets";
import sandboxes from "schema/sandboxes";
import users from "schema/users";
import { pipe, Effect } from "effect";
import { consola } from "consola";
import secrets, { type SelectSecret } from "schema/secrets";
import sandboxSecrets from "schema/sandbox-secrets";

export default function (server: Server, ctx: Context) {
  const getSecrets = (params: QueryParams, auth: HandlerAuth) => {
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
        consola.error("Error retrieving secrets:", err);
        return Effect.succeed({ sandboxes: [] });
      }),
    );
  };

  server.io.pocketenv.secret.getSecrets({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await Effect.runPromise(getSecrets(params, auth));
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
}): Effect.Effect<[SelectSecret[], number], Error> => {
  return Effect.tryPromise({
    try: async () =>
      Promise.all([
        ctx.db
          .select()
          .from(sandboxSecrets)
          .leftJoin(sandboxes, eq(sandboxes.id, sandboxSecrets.sandboxId))
          .leftJoin(secrets, eq(secrets.id, sandboxSecrets.secretId))
          .leftJoin(users, eq(users.id, sandboxes.userId))
          .where(
            params.sandboxId
              ? and(
                  eq(users.did, auth.credentials.did),
                  eq(sandboxSecrets.sandboxId, params.sandboxId),
                )
              : eq(users.did, auth.credentials.did),
          )
          .offset(params.offset ?? 0)
          .limit(params.limit ?? 20)
          .execute()
          .then((rows) =>
            rows
              .map((row) => row.secrets)
              .filter((variable) => variable !== null),
          ),
        ctx.db
          .select({
            count: count(),
          })
          .from(sandboxSecrets)
          .leftJoin(sandboxes, eq(sandboxes.id, sandboxSecrets.sandboxId))
          .leftJoin(users, eq(users.id, sandboxes.userId))
          .where(
            params.sandboxId
              ? and(
                  eq(users.did, auth.credentials.did),
                  eq(sandboxSecrets.sandboxId, params.sandboxId),
                )
              : eq(users.did, auth.credentials.did),
          )
          .execute()
          .then((result) => result[0]?.count ?? 0),
      ]),
    catch: (error) => {
      consola.error("Error retrieving secrets:", error);
      throw new XRPCError(
        500,
        `Failed to retrieve secrets: ${error instanceof Error ? error.message : String(error)}`,
      );
    },
  });
};

const presentation = ([secrets, total]: [
  SelectSecret[],
  number,
]): Effect.Effect<OutputSchema, never> => {
  return Effect.sync(() => ({
    secrets: secrets.map((secret) => ({
      id: secret.id,
      name: secret.name,
      createdAt: secret.createdAt.toISOString(),
    })),
    total,
  }));
};
