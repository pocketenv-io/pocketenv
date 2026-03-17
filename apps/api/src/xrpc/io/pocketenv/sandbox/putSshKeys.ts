import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import { and, eq, or } from "drizzle-orm";
import type { Server } from "lexicon";
import type { InputSchema } from "lexicon/types/io/pocketenv/sandbox/putSshKeys";
import sandboxes from "schema/sandboxes";
import sshKeys from "schema/ssh-keys";
import users from "schema/users";

export default function (server: Server, ctx: Context) {
  const putSshKeys = async (input: InputSchema, auth: HandlerAuth) => {
    if (!auth.credentials) {
      throw new XRPCError(401, "Unauthorized");
    }

    await ctx.db.transaction(async (tx) => {
      const sandbox = await tx
        .select()
        .from(sandboxes)
        .leftJoin(users, eq(sandboxes.userId, users.id))
        .where(
          and(
            or(eq(sandboxes.id, input.id), eq(sandboxes.sandboxId, input.id)),
            eq(users.did, auth.credentials.did),
          ),
        )
        .execute();
      if (sandbox.length === 0) {
        throw new XRPCError(404, "Sandbox not found");
      }
      await tx
        .delete(sshKeys)
        .where(eq(sshKeys.sandboxId, sandbox[0]!.sandboxes.id))
        .execute();
      await tx
        .insert(sshKeys)
        .values({
          publicKey: input.publicKey,
          privateKey: input.privateKey,
          redacted: input.redacted,
          sandboxId: sandbox[0]!.sandboxes.id,
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
