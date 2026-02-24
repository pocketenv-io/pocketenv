import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/file/deleteFile";

export default function (server: Server, ctx: Context) {
  const deleteFile = async (input: HandlerInput, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.file.deleteFile({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await deleteFile(input, auth);
    },
  });
}
