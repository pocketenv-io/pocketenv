import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/secret/addSecret";

export default function (server: Server, ctx: Context) {
  const addSecret = async (input: HandlerInput, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.secret.addSecret({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await addSecret(input, auth);
    },
  });
}
