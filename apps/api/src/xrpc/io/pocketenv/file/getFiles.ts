import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq, and, count } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  OutputSchema,
} from "lexicon/types/io/pocketenv/file/getFiles";
import files from "schema/files";
import sandboxFiles, { type SelectSandboxFile } from "schema/sandbox-files";
import sandboxes from "schema/sandboxes";
import users from "schema/users";
import { pipe, Effect } from "effect";
import { consola } from "consola";

export default function (server: Server, ctx: Context) {
  const getFiles = (params: QueryParams, auth: HandlerAuth) => {
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
        consola.error("Error retrieving files:", err);
        return Effect.succeed({ sandboxes: [] });
      }),
    );
  };

  server.io.pocketenv.file.getFiles({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await Effect.runPromise(getFiles(params, auth));
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
}): Effect.Effect<[SelectSandboxFile[], number], Error> => {
  return Effect.tryPromise({
    try: async () =>
      Promise.all([
        ctx.db
          .select()
          .from(sandboxFiles)
          .leftJoin(sandboxes, eq(sandboxes.id, sandboxFiles.sandboxId))
          .leftJoin(files, eq(files.id, sandboxFiles.fileId))
          .leftJoin(users, eq(users.id, sandboxes.userId))
          .where(
            params.sandboxId
              ? and(
                  eq(users.did, auth.credentials.did),
                  eq(sandboxFiles.sandboxId, params.sandboxId),
                )
              : eq(users.did, auth.credentials.did),
          )
          .offset(params.offset ?? 0)
          .limit(params.limit ?? 20)
          .execute()
          .then((rows) =>
            rows
              .map((row) => row.sandbox_files)
              .filter((file) => file !== null),
          ),
        ctx.db
          .select({
            count: count(),
          })
          .from(sandboxFiles)
          .leftJoin(sandboxes, eq(sandboxes.id, sandboxFiles.sandboxId))
          .leftJoin(files, eq(files.id, sandboxFiles.fileId))
          .leftJoin(users, eq(users.id, sandboxes.userId))
          .where(
            params.sandboxId
              ? and(
                  eq(users.did, auth.credentials.did),
                  eq(sandboxFiles.sandboxId, params.sandboxId),
                )
              : eq(users.did, auth.credentials.did),
          )
          .execute()
          .then((result) => result[0]?.count ?? 0),
      ]),
    catch: (error) => {
      consola.error("Error retrieving files:", error);
      throw new XRPCError(
        500,
        `Failed to retrieve files: ${error instanceof Error ? error.message : String(error)}`,
      );
    },
  });
};

const presentation = ([files, total]: [
  SelectSandboxFile[],
  number,
]): Effect.Effect<OutputSchema, never> => {
  return Effect.sync(() => ({
    files: files.map((file) => ({
      id: file.id,
      path: file.path,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    })),
    total,
  }));
};
