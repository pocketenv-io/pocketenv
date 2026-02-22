import { XRPCError, type HandlerAuth } from "@atproto/xrpc-server";
import type { Context } from "context";
import type { Server } from "lexicon";
import generateJwt from "lib/generateJwt";

export default function (server: Server, ctx: Context) {
  const getTerminalToken = async (auth: HandlerAuth) => {
    if (!auth?.credentials?.did) {
      throw new XRPCError(401, "Unauthorized");
    }
    const token = await generateJwt(auth.credentials.did as string);

    return {
      token,
    };
  };
  server.io.pocketenv.actor.getTerminalToken({
    auth: ctx.authVerifier,
    handler: async ({ auth }) => {
      const result = await getTerminalToken(auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
