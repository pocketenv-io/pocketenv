import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/sandbox/putPreferences";

export default function (server: Server, ctx: Context) {
  const putPreferences = async (input: HandlerInput, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.sandbox.putPreferences({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await putPreferences(input, auth);
    },
  });
}
