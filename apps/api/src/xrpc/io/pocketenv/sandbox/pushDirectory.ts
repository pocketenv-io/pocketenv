import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { InputSchema } from "lexicon/types/io/pocketenv/sandbox/pushDirectory";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const pushDirectory = async (input: InputSchema, auth: HandlerAuth) => {
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

    const sandbox =
      record.sandboxes.provider === Providers.CLOUDFLARE
        ? ctx.cfsandbox(record.sandboxes.base!)
        : ctx.sandbox();

    const response = await sandbox.post<{ uuid: string }>(
      `/v1/sandboxes/${record.sandboxes.id}/push-directory`,
      {
        directoryPath: input.directoryPath,
      },
      {
        headers: {
          Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
        },
      },
    );

    return response.data.uuid;
  };
  server.io.pocketenv.sandbox.pushDirectory({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      const uuid = await pushDirectory(input.body, auth);
      return {
        encoding: "application/json",
        body: { uuid },
      };
    },
  });
}
