import type { HandlerAuth } from "@atproto/xrpc-server";
import { consola } from "consola";
import type { Context } from "context";
import type { Server } from "lexicon";
import type { HandlerInput } from "lexicon/types/io/pocketenv/sandbox/createSandbox";
import generateJwt from "lib/generateJwt";
import type * as Sandbox from "lexicon/types/io/pocketenv/sandbox";
import chalk from "chalk";
import { createAgent } from "lib/agent";
import { TID } from "@atproto/common";
import schema from "schema";
import { eq } from "drizzle-orm";

export default function (server: Server, ctx: Context) {
  const createSandbox = async (input: HandlerInput, auth: HandlerAuth) => {
    const res = await ctx.sandbox.post(
      "/v1/sandboxes",
      {
        provider: "daytona",
      },
      {
        ...(auth?.credentials && {
          headers: {
            Authorization: `Bearer ${await generateJwt(auth.credentials.did)}`,
          },
        }),
      },
    );

    let uri: string | null = null;

    if (auth?.credentials) {
      const agent = await createAgent(ctx.oauthClient, auth.credentials.did);

      consola.info(
        `Writing ${chalk.greenBright("io.pocketenv.sandbox")} record...`,
      );

      const record: Sandbox.Record = {
        $type: "io.pocketenv.sandbox",
        name: res.data.name,
        description: res.data.description,
        vcpus: res.data.vcpus,
        memory: res.data.memory,
        disk: res.data.disk,
        createdAt: new Date().toISOString(),
      };

      if (!agent) {
        consola.error("failed to create agent");
        process.exit(1);
      }

      const rkey = TID.nextStr();
      const { data } = await agent.com.atproto.repo.createRecord({
        repo: agent.assertDid,
        collection: "io.pocketenv.sandbox",
        record,
        rkey: rkey,
      });

      consola.info(chalk.greenBright("Sandbox created successfully!"));
      consola.info(`Record created at: ${chalk.cyan(data.uri)}`);

      await ctx.db
        .update(schema.sandboxes)
        .set({ uri: data.uri })
        .where(eq(schema.sandboxes.id, res.data.id))
        .execute();

      uri = data.uri;
    }
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
      uri,
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
