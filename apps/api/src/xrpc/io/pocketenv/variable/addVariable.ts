import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/variable/addVariable";

export default function (server: Server, ctx: Context) {
  const addVariable = async (input: HandlerInput, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.variable.addVariable({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await addVariable(input, auth);
    },
  });
}
