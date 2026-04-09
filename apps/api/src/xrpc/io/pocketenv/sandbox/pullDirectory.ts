import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { InputSchema } from "lexicon/types/io/pocketenv/sandbox/pullDirectory";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const pullDirectory = async (input: InputSchema, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    const record = await ctx.db
      .select()
      .from(schema.sandboxes)
      .leftJoin(schema.users, eq(schema.users.id, schema.sandboxes.userId))
      .where(
        and(
          or(
            eq(schema.sandboxes.id, input.sandboxId),
            eq(schema.sandboxes.name, input.sandboxId),
            eq(schema.sandboxes.uri, input.sandboxId),
          ),
          eq(schema.users.did, auth.credentials.did),
        ),
      )
      .execute()
      .then(([row]) => row);

    if (!record) {
      throw new XRPCError(404, "Sandbox not found");
    }

    if (record.sandboxes.status !== "RUNNING") {
      throw new XRPCError(400, "Sandbox is not running");
    }

    const sandbox =
      record.sandboxes.provider === Providers.CLOUDFLARE
        ? ctx.cfsandbox(record.sandboxes.base!)
        : ctx.sandbox(record.sandboxes.provider);

    await sandbox.post(
      `/v1/sandboxes/${record.sandboxes.id}/pull-directory`,
      {
        uuid: input.uuid,
        directoryPath: input.directoryPath,
      },
      {
        headers: {
          Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
        },
      },
    );
  };
  server.io.pocketenv.sandbox.pullDirectory({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await pullDirectory(input.body, auth);
    },
  });
}
