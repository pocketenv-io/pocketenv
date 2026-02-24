import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/volume/addVolume";

export default function (server: Server, ctx: Context) {
  const addVolume = async (input: HandlerInput, auth: HandlerAuth) => {
    return {};
  };
  server.io.pocketenv.volume.addVolume({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      await addVolume(input, auth);
    },
  });
}
