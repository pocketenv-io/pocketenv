import chalk from "chalk";
import { consola } from "consola";
import { ctx } from "../src/context";
import type * as Sandbox from "../src/lexicon/types/io/pocketenv/sandbox";
import { createAgent } from "../src/lib/agent";
import prompts from "prompts";

const args = process.argv.slice(2);

if (args.length === 0) {
  consola.error("Please provide user author identifier (handle or DID).");
  console.log(`Usage: ${chalk.cyan("npm run sandbox -- <handle|did>")}`);
  process.exit(1);
}

const name = await prompts({
  type: "text",
  name: "value",
  message: "What is the sandbox name?",
});

if (name.value.length < 3 || name.value.length > 240) {
  consola.error("Sandbox name must be between 3 and 240 characters.");
  process.exit(1);
}

const description = await prompts({
  type: "text",
  name: "value",
  message: "Please provide a short description of the sandbox",
});

if (description.value.length > 3000) {
  consola.error("Description is too long. Maximum length is 3000 characters.");
  process.exit(1);
}

const rkey = await prompts({
  type: "text",
  name: "value",
  message: "What is the record key (rkey) for the sandbox?",
});

if (!/^[a-zA-Z0-9_-]{3,30}$/.test(rkey.value)) {
  consola.error(
    "Invalid record key. Only alphanumeric characters, underscores, and hyphens are allowed. Length must be between 3 and 30 characters.",
  );
  process.exit(1);
}

consola.info("Creating sandbox with the following details:");
consola.info("---");
consola.info("Sandbox name:", name.value);
consola.info("Description:", description.value);
consola.info("Record key (rkey):", rkey.value);

const confirm = await prompts({
  type: "confirm",
  name: "value",
  message: "Do you want to proceed?",
  initial: true,
});

if (!confirm.value) {
  consola.info("Sandbox creation cancelled.");
  process.exit(0);
}

let userDid = args[0];

if (!userDid?.startsWith("did:plc:")) {
  userDid = await ctx.baseIdResolver.handle.resolve(userDid!);
}

const agent = await createAgent(ctx.oauthClient, userDid!);

consola.info(`Writing ${chalk.greenBright("io.pocketenv.sandbox")} record...`);

const record: Sandbox.Record = {
  $type: "io.pocketenv.sandbox",
  name: name.value,
  description: description.value,
  vcpus: 1,
  memory: 4,
  disk: 3,
  createdAt: new Date().toISOString(),
};

if (!agent) {
  consola.error("failed to create agent");
  process.exit(1);
}

const res = await agent.com.atproto.repo.createRecord({
  repo: agent.assertDid,
  collection: "io.pocketenv.sandbox",
  record,
  rkey: rkey.value,
});

consola.info(chalk.greenBright("Sandbox created successfully!"));
consola.info(`Record created at: ${chalk.cyan(res.data.uri)}`);

process.exit(0);
