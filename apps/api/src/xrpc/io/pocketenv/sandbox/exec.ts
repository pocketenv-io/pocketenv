import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { and, eq, isNull, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type {
  QueryParams,
  InputSchema,
  OutputSchema,
} from "lexicon/types/io/pocketenv/sandbox/exec";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const exec = async (
    params: QueryParams,
    input: InputSchema,
    auth: HandlerAuth,
  ) => {
    let userId: string | undefined;
    if (auth.credentials) {
      const [user] = await ctx.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.did, auth.credentials.did))
        .execute();
      userId = user?.id;
    }

    const record = await ctx.db
      .select()
      .from(schema.sandboxes)
      .where(
        and(
          or(
            eq(schema.sandboxes.id, params.id),
            eq(schema.sandboxes.name, params.id),
          ),
          userId
            ? eq(schema.sandboxes.userId, userId)
            : isNull(schema.sandboxes.userId),
        ),
      )
      .execute()
      .then(([row]) => row);

    if (!record) {
      throw new XRPCError(404, "Sandbox not found", "SandboxNotFound");
    }

    const sandbox =
      record.provider === Providers.CLOUDFLARE
        ? ctx.cfsandbox(record.base!)
        : ctx.sandbox(record?.provider);

    const result = await sandbox.post<{
      stderr: string;
      stdout: string;
      exitCode: number;
    }>(
      `/v1/sandboxes/${record.id}/runs`,
      {
        command: input.command,
      },
      {
        headers: {
          Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
        },
      },
    );

    return result.data;
  };
  server.io.pocketenv.sandbox.exec({
    auth: ctx.authVerifier,
    handler: async ({ params, input, auth }) => {
      const result = await exec(params, input.body, auth);
      return {
        encoding: "application/json",
        body: result satisfies OutputSchema,
      };
    },
  });
}
