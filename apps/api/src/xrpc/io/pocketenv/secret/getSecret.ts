import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq, and, count, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/secret/getSecret";
import sandboxes from "schema/sandboxes";
import users from "schema/users";
import { pipe, Effect } from "effect";
import { consola } from "consola";
import secrets, { type SelectSecret } from "schema/secrets";
import sandboxSecrets from "schema/sandbox-secrets";

export default function (server: Server, ctx: Context) {
  const getSecret = (params: QueryParams, auth: HandlerAuth) => {
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
        consola.error("Error retrieving secret:", err);
        return Effect.succeed({ secrets: [] });
      }),
    );
  };

  server.io.pocketenv.secret.getSecret({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await Effect.runPromise(getSecret(params, auth));
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
}): Effect.Effect<SelectSecret[], Error> => {
  return Effect.tryPromise({
    try: async () =>
      ctx.db
        .select()
        .from(sandboxSecrets)
        .leftJoin(sandboxes, eq(sandboxes.id, sandboxSecrets.sandboxId))
        .leftJoin(secrets, eq(secrets.id, sandboxSecrets.secretId))
        .leftJoin(users, eq(users.id, sandboxes.userId))
        .where(
          and(
            eq(users.did, auth.credentials.did),
            or(
              eq(sandboxSecrets.id, params.id),
              eq(sandboxSecrets.secretId, params.id),
            ),
          ),
        )
        .execute()
        .then((rows) =>
          rows
            .map((row) => row.secrets)
            .filter((variable) => variable !== null),
        ),
    catch: (error) => {
      consola.error("Error retrieving secret:", error);
      throw new XRPCError(
        500,
        `Failed to retrieve secret: ${error instanceof Error ? error.message : String(error)}`,
      );
    },
  });
};

const presentation = (
  secrets: SelectSecret[],
): Effect.Effect<OutputSchema, never> => {
  return Effect.sync(() => ({
    secret: secrets.map((secret) => ({
      id: secret.id,
      name: secret.name,
      createdAt: secret.createdAt.toISOString(),
    }))[0],
  }));
};
