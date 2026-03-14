import chalk from "chalk";
import { version } from "../package.json" assert { type: "json" };
import { Command } from "commander";
import start from "./cmd/start";
import login from "./cmd/login";
import whoami from "./cmd/whoami";
import ssh from "./cmd/ssh";
import listSandboxes from "./cmd/list";
import stop from "./cmd/stop";
import createSandbox from "./cmd/create";
import logout from "./cmd/logout";
import deleteSandbox from "./cmd/rm";
import { deleteSecret, listSecrets, putSecret } from "./cmd/secret";
import { deleteEnv, listEnvs, putEnv } from "./cmd/env";
import { getSshKey, putKeys } from "./cmd/sshkeys";
import { getTailscaleAuthKey, putAuthKey } from "./cmd/tailscale";

const program = new Command();

program
  .name("pocketenv")
  .description(
    `
    ___           __       __
   / _ \\___  ____/ /_____ / /____ ___ _  __
  / ___/ _ \\/ __/  '_/ -_) __/ -_) _ \\ |/ /
 /_/   \\___/\\__/_/\\_\\__/\\__/\\__/_/ /_/___/

 Open, interoperable sandbox platform for agents and humans 📦 ✨
  `,
  )
  .version(version);

program.configureHelp({
  styleTitle: (str) => chalk.bold.cyan(str),
  styleCommandText: (str) => chalk.yellow(str),
  styleDescriptionText: (str) => chalk.white(str),
  styleOptionText: (str) => chalk.green(str),
  styleArgumentText: (str) => chalk.magenta(str),
  styleSubcommandText: (str) => chalk.blue(str),
});

program.addHelpText(
  "after",
  `
${chalk.bold("\nLearn more about Pocketenv:")}           ${chalk.magentaBright("https://docs.pocketenv.io")}
${chalk.bold("Join our Discord community:")}           ${chalk.blueBright("https://discord.gg/9ada4pFUFS")}
${chalk.bold("Report bugs:")}                          ${chalk.greenBright("https://github.com/pocketenv-io/pocketenv/issues")}
`,
);

program
  .command("login")
  .argument("<handle>", "your AT Proto handle (e.g., <username>.bsky.social)")
  .description("login with your AT Proto account and get a session token")
  .action(login);

program
  .command("whoami")
  .description("get the current logged-in user")
  .action(whoami);

program
  .command("console")
  .aliases(["shell", "ssh", "s"])
  .argument("[sandbox]", "the sandbox to connect to")
  .description("open an interactive shell for the given sandbox")
  .action(ssh);

program.command("ls").description("list sandboxes").action(listSandboxes);

program
  .command("start")
  .argument("<sandbox>", "the sandbox to start")
  .description("start the given sandbox")
  .action(start);

program
  .command("stop")
  .argument("<sandbox>", "the sandbox to stop")
  .description("stop the given sandbox")
  .action(stop);

program
  .command("create")
  .aliases(["new"])
  .option("--provider, -p <provider>", "the provider to use for the sandbox")
  .argument("[name]", "the name of the sandbox to create")
  .description("create a new sandbox")
  .action(createSandbox);

program
  .command("logout")
  .description("logout (removes session token)")
  .action(logout);

program
  .command("rm")
  .aliases(["delete", "remove"])
  .argument("<sandbox>", "the sandbox to delete")
  .description("delete the given sandbox")
  .action(deleteSandbox);

const secret = program.command("secret").description("manage secrets");

secret
  .command("put")
  .argument("<sandbox>", "the sandbox to put the secret in")
  .argument("<key>", "the key of the secret")
  .description("put a secret in the given sandbox")
  .action(putSecret);

secret
  .command("list")
  .aliases(["ls"])
  .argument("<sandbox>", "the sandbox to list secrets for")
  .description("list secrets in the given sandbox")
  .action(listSecrets);

secret
  .command("delete")
  .aliases(["rm", "remove"])
  .argument("<sandbox>", "the sandbox to delete secrets from")
  .argument("<key>", "the key of the secret to delete")
  .description("delete a secret from the given sandbox")
  .action(deleteSecret);

const env = program.command("env").description("manage environment variables");

env
  .command("put")
  .argument("<sandbox>", "the sandbox to put the environment variable in")
  .argument("<key>", "the key of the environment variable")
  .argument("<value>", "the value of the environment variable")
  .description("put an environment variable in the given sandbox")
  .action(putEnv);

env
  .command("list")
  .aliases(["ls"])
  .argument("<sandbox>", "the sandbox to list environment variables for")
  .description("list environment variables in the given sandbox")
  .action(listEnvs);

env
  .command("delete")
  .aliases(["rm", "remove"])
  .argument("<sandbox>", "the sandbox to delete environment variables from")
  .argument("<key>", "the key of the environment variable to delete")
  .description("delete an environment variable from the given sandbox")
  .action(deleteEnv);

const sshkeys = program.command("sshkeys").description("manage SSH keys");

sshkeys
  .command("put")
  .argument("<sandbox>", "the sandbox to put the SSH key in")
  .option("--private-key", "the path to the SSH private key")
  .option("--public-key", "the path to the SSH public key")
  .description("put an SSH key in the given sandbox")
  .action(putKeys);

sshkeys
  .command("get")
  .argument("<sandbox>", "the sandbox to get the SSH key from")
  .description("get an SSH key (public key only) from the given sandbox")
  .action(getSshKey);

const tailscale = program.command("tailscale").description("manage Tailscale");

tailscale
  .command("put")
  .argument("<sandbox>", "the sandbox to put the Tailscale Auth Key in")
  .description("put a Tailscale key in the given sandbox")
  .action(putAuthKey);

tailscale
  .command("get")
  .argument("<sandbox>", "the sandbox to get the Tailscale key from")
  .description("get a Tailscale key (redacted) from the given sandbox")
  .action(getTailscaleAuthKey);

if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
