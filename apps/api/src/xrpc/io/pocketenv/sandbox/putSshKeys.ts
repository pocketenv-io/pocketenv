import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { eq } from "drizzle-orm";
import type { Server } from "lexicon";
import type { InputSchema } from "lexicon/types/io/pocketenv/sandbox/putSshKeys";
import sshKeys from "schema/ssh-keys";

export default function (server: Server, ctx: Context) {
  const putSshKeys = async (input: InputSchema, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.transaction(async (tx) => {
      await tx.delete(sshKeys).where(eq(sshKeys.sandboxId, input.id)).execute();
      await tx
        .insert(sshKeys)
        .values({
          publicKey: input.publicKey,
          privateKey: input.privateKey,
          redacted: input.redacted,
          sandboxId: input.id,
        })
        .execute();
    });

    return {};
  };
  server.io.pocketenv.sandbox.putSshKeys({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      const result = await putSshKeys(input.body, auth);
      return {
        encoding: "application/json",
        body: result as any, // TODO: Implement putSshKeys
      };
    },
  });
}
