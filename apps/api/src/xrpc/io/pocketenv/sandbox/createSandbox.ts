import type { HandlerAuth } from "@atproto/xrpc-server";
import { consola } from "consola";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/sandbox/createSandbox";

export default function (server: Server, ctx: Context) {
  const createSandbox = async (input: HandlerInput, auth: HandlerAuth) => {
    const res = await ctx.sandbox.post("/v1/sandboxes", {
      provider: "daytona",
    });
    return {
      id: res.data.id,
      name: input.body.name || "Unnamed Sandbox",
      provider: "daytona", // or whatever provider you're using
      description: input.body.description,
      topics: input.body.topics,
      repo: input.body.repo,
      vcpus: input.body.vcpus,
      memory: input.body.memory,
      disk: input.body.disk,
      readme: input.body.readme,
      createdAt: new Date().toISOString(),
      // Add other required fields
    };
  };
  server.io.pocketenv.sandbox.createSandbox({
    auth: ctx.authVerifier,
    handler: async ({ input, auth }) => {
      const result = await createSandbox(input, auth);
      return {
        encoding: "application/json",
        body: result,
      };
    },
  });
}
