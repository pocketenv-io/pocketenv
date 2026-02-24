import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/file/addFile";

export default function (server: Server, ctx: Context) {
  const addFile = async (input: HandlerInput, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.file.addFile({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await addFile(input, auth);
    },
  });
}
