import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { InputSchema } from "lexicon/types/io/pocketenv/sandbox/createIntegration";

export default function (server: Server, ctx: Context) {
  const createIntegration = async (input: InputSchema, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.sandbox.createIntegration({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      const result = await createIntegration(input.body, auth);
      return {
        encoding: "application/json",
        body: result as any, // TODO: Implement createIntegration
      };
    },
  });
}
