import type { Agent } from "@atproto/api";
import chalk from "chalk";
import { consola } from "consola";
import { ctx } from "context";
import { eq } from "drizzle-orm";
import { createAgent } from "lib/agent";
import * as Sandbox from "../src/lexicon/types/io/pocketenv/sandbox";
import schema from "schema";
import type { InsertSandbox } from "schema/sandboxes";
import { env } from "lib/env";

const args = process.argv.slice(2);

if (args.length === 0) {
  consola.error("Please provide user author identifier (handle or DID).");
  consola.info(`Usage: ${chalk.cyan("npm run seed -- <handle|did>")}`);
  process.exit(1);
}

async function getSandboxes(agent: Agent, limit: number = 100) {
  const res = await agent.com.atproto.repo.listRecords({
    repo: agent.assertDid,
    collection: "io.pocketenv.sandbox",
    limit,
  });
  return res.data.records.map((record) => ({
    ...record,
    value: Sandbox.isRecord(record.value) ? record.value : null,
  }));
}

let userDid = args[0];

if (userDid && !userDid.startsWith("did:plc:")) {
  userDid = await ctx.baseIdResolver.handle.resolve(userDid);
}

if (!userDid) {
  consola.error("Could not resolve user DID.");
  process.exit(1);
}

const agent = await createAgent(ctx.oauthClient, userDid);
if (!agent) {
  consola.error("Could not create agent for the provided DID.");
  process.exit(1);
}

const [user] = await ctx.db
  .select()
  .from(schema.users)
  .where(eq(schema.users.did, agent.assertDid))
  .execute();

const sandboxes = await getSandboxes(agent);

for (const sandbox of sandboxes) {
  if (!sandbox.value) continue;

  await ctx.db
    .insert(schema.sandboxes)
    .values({
      name: sandbox.uri.split("/").slice(-1)[0]!,
      displayName: sandbox.value.name,
      description: sandbox.value.description,
      provider: "daytona",
      status: "STOPPED",
      uri: sandbox.uri,
      cid: sandbox.cid,
      publicKey: env.PUBLIC_KEY,
      vcpus: sandbox.value.vcpus,
      memory: sandbox.value.memory,
      disk: sandbox.value.disk,
      userId: user!.id,
    } satisfies InsertSandbox)
    .onConflictDoNothing()
    .execute();
  consola.info(
    `Sandbox ${chalk.cyanBright(sandbox.value.name)} seeded successfully.`,
  );
}

process.exit(0);
