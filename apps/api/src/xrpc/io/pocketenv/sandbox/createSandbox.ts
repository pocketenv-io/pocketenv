import { XRPCError } from "@atproto/xrpc-server";
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
import {
  validateMain,
  type Main,
} from "lexicon/types/com/atproto/repo/strongRef";
import { Providers } from "consts";

export default function (server: Server, ctx: Context) {
  const createSandbox = async (input: HandlerInput, auth: HandlerAuth) => {
    let res;
    try {
      const provider = input.body.provider || Providers.CLOUDFLARE;
      const sandbox =
        provider === Providers.CLOUDFLARE ? ctx.cfsandbox : ctx.sandbox;
      res = await sandbox.post(
        "/v1/sandboxes",
        {
          provider,
        },
        {
          headers: {
            Authorization: `Bearer ${await generateJwt(auth?.credentials?.did || "")}`,
          },
        },
      );
    } catch (err: unknown) {
      consola.error("Failed to create sandbox via provider API:", err);
      throw new XRPCError(
        502,
        "Failed to create sandbox with the provider",
        "SandboxProviderError",
      );
    }

    let uri: string | null = null;

    if (auth?.credentials) {
      const agent = await createAgent(ctx.oauthClient, auth.credentials.did);

      if (!agent) {
        consola.error(
          "Failed to create AT Protocol agent for DID:",
          auth.credentials.did,
        );
        throw new XRPCError(
          500,
          "Failed to create AT Protocol agent",
          "AgentCreationError",
        );
      }

      consola.info(
        `Writing ${chalk.greenBright("io.pocketenv.sandbox")} record...`,
      );

      let baseRef: { success: true; value: Main } | null = null;

      try {
        const base = await ctx.db
          .select()
          .from(schema.sandboxes)
          .where(eq(schema.sandboxes.name, "openclaw"))
          .execute()
          .then(([row]) => row);

        if (base?.uri && base?.cid) {
          const validated = validateMain({
            uri: base.uri,
            cid: base.cid,
          });

          if (validated.success) {
            baseRef = { success: true, value: validated.value as Main };
          } else {
            consola.warn(
              "Base record reference validation failed, proceeding without base:",
              validated.error,
            );
          }
        } else {
          consola.warn(
            "No 'openclaw' base sandbox found in database, proceeding without base reference.",
          );
        }
      } catch (err: unknown) {
        consola.warn(
          "Failed to query base sandbox, proceeding without base:",
          err,
        );
      }

      const record: Sandbox.Record = {
        $type: "io.pocketenv.sandbox",
        name: res.data.name,
        description: res.data.description,
        vcpus: res.data.vcpus,
        memory: res.data.memory,
        disk: res.data.disk,
        ...(baseRef && { base: baseRef.value }),
        createdAt: new Date().toISOString(),
      };

      try {
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
          .set({ uri: data.uri, cid: data.cid })
          .where(eq(schema.sandboxes.id, res.data.id))
          .execute();

        uri = data.uri;
      } catch (err: unknown) {
        consola.error(
          "Failed to create AT Protocol record or update database:",
          err,
        );
        throw new XRPCError(
          500,
          "Sandbox was created but failed to persist the record",
          "RecordCreationError",
        );
      }
    }

    return {
      id: res.data.id,
      name: input.body.name || "Unnamed Sandbox",
      provider: input.body.provider || Providers.DENO,
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
