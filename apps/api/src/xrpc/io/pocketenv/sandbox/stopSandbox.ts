import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import { Providers } from "consts";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { QueryParams } from "lexicon/types/io/pocketenv/sandbox/stopSandbox";
import generateJwt from "lib/generateJwt";
import schema from "schema";

export default function (server: Server, ctx: Context) {
  const stopSandbox = async (params: QueryParams, auth: HandlerAuth) => {
    const record = await ctx.db
      .select()
      .from(schema.sandboxes)
      .where(eq(schema.sandboxes.id, params.id))
      .execute()
      .then(([row]) => row);

    if (!record) {
      throw new XRPCError(404, "Sandbox not found", "SandboxNotFound");
    }

    const sandbox =
      record.provider === Providers.CLOUDFLARE
        ? ctx.cfsandbox(record.base!)
        : ctx.sandbox();

    await sandbox.post(`/v1/sandboxes/${params.id}/stop`, undefined, {
      headers: {
        Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
      },
    });
    return {};
  };
  server.io.pocketenv.sandbox.stopSandbox({
    auth: ctx.authVerifier,
    handler: async ({ params, auth }) => {
      const result = await stopSandbox(params, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
