import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/sandbox/updateSandboxSettings";

export default function (server: Server, ctx: Context) {
  const updateSandboxSettings = async (
    input: HandlerInput,
    auth: HandlerAuth,
  ) => {
    return {};
  };
  server.io.pocketenv.sandbox.updateSandboxSettings({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      const result = await updateSandboxSettings(input, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
