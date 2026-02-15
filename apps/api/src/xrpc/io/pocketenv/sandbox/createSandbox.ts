import type { HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/sandbox/createSandbox";

export default function (server: Server, ctx: Context) {
  const createSandbox = (input: HandlerInput, auth: HandlerAuth) => ({});
  server.io.pocketenv.sandbox.createSandbox({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      const result = createSandbox(input, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
