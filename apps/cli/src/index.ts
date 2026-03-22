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
import { exposePort } from "./cmd/expose";
import { unexposePort } from "./cmd/unexpose";
import { createVolume, deleteVolume, listVolumes } from "./cmd/volume";
import { deleteFile, listFiles, putFile } from "./cmd/file";
import consola from "consola";
import { listPorts } from "./cmd/ports";
import { c } from "./theme";
import { exposeVscode } from "./cmd/vscode";
import { exec } from "./cmd/exec";

const program = new Command();

program
  .name("pocketenv")
  .description(
    `${chalk.bold.rgb(0, 232, 198)(`pocketenv v${version}`)} ${c.muted("─")} ${c.muted("Open, interoperable sandbox platform for agents and humans")}`,
  )
  .version(version);

program.configureHelp({
  styleTitle: (str) => chalk.bold.rgb(0, 210, 255)(str),
  styleCommandText: (str) => c.secondary(str),
  styleDescriptionText: (str) => c.muted(str),
  styleOptionText: (str) => c.highlight(str),
  styleArgumentText: (str) => c.accent(str),
  styleSubcommandText: (str) => c.secondary(str),
});

program.addHelpText(
  "after",
  `
${chalk.bold.rgb(0, 210, 255)("─".repeat(90))}
  ${chalk.bold.rgb(0, 232, 198)("Learn more:")}     ${c.link("https://docs.pocketenv.io")}
  ${chalk.bold.rgb(0, 232, 198)("Discord:")}        ${c.link("https://discord.gg/9ada4pFUFS")}
  ${chalk.bold.rgb(0, 232, 198)("Report bugs:")}    ${c.link("https://github.com/pocketenv-io/pocketenv/issues")}
${chalk.bold.rgb(0, 210, 255)("─".repeat(90))}
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
  .option("--ssh, -s", "connect to the Sandbox and automatically open a shell")
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
  .option(
    "--base, -b <base>",
    "the base sandbox to use for the sandbox, e.g. openclaw, claude-code, codex, copilot ...",
  )
  .option("--ssh, -s", "connect to the Sandbox and automatically open a shell")
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

program
  .command("vscode")
  .aliases(["code", "code-server"])
  .argument("<sandbox>", "the sandbox to expose VS Code for")
  .description("expose a visual code server to the internet")
  .action(exposeVscode);

program
  .enablePositionalOptions()
  .command("exec")
  .argument("<sandbox>", "the sandbox to execute the command in")
  .argument("<command...>", "the command to execute")
  .description("execute a command in the given sandbox")
  .passThroughOptions()
  .action(exec);

program
  .command("expose")
  .argument("<sandbox>", "the sandbox to expose a port for")
  .argument("<port>", "the port to expose", (val) => {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
      consola.error(`port must be a number, got: ${val}`);
      process.exit(1);
    }
    return port;
  })
  .argument("[description]", "an optional description for the exposed port")
  .description("expose a port from the given sandbox to the internet")
  .action(exposePort);

program
  .command("unexpose")
  .argument("<sandbox>", "the sandbox to unexpose a port for")
  .argument("<port>", "the port to unexpose", (val) => {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
      consola.error(`port must be a number, got: ${val}`);
      process.exit(1);
    }
    return port;
  })
  .description("unexpose a port from the given sandbox")
  .action(unexposePort);

const volume = program.command("volume").description("manage volumes");

volume
  .command("put")
  .argument("<sandbox>", "the sandbox to put the volume in")
  .argument("<name>", "the name of the volume")
  .argument("<path>", "the path to mount the volume at")
  .description("put a volume in the given sandbox")
  .action(createVolume);

volume
  .command("list")
  .aliases(["ls"])
  .argument("<sandbox>", "the sandbox to list volumes for")
  .description("list volumes in the given sandbox")
  .action(listVolumes);

volume
  .command("delete")
  .aliases(["rm", "remove"])
  .argument("<id>", "the ID of the volume to delete")
  .description("delete a volume")
  .action(deleteVolume);

const file = program.command("file").description("manage files");

file
  .command("put")
  .argument("<sandbox>", "the sandbox to put the file in")
  .argument("<path>", "the remote path to upload the file to")
  .argument("[localPath]", "the local path of the file to upload")
  .description("upload a file to the given sandbox")
  .action(putFile);

file
  .command("list")
  .aliases(["ls"])
  .argument("<sandbox>", "the sandbox to list files for")
  .description("list files in the given sandbox")
  .action(listFiles);

file
  .command("delete")
  .aliases(["rm", "remove"])
  .argument("<id>", "the ID of the file to delete")
  .description("delete a file")
  .action(deleteFile);

program
  .command("ports")
  .argument("<sandbox>", "the sandbox to list exposed ports for")
  .description("list exposed ports for a sandbox")
  .action(listPorts);

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
  .argument("<secret_id>", "the ID of the secret to delete")
  .description("delete a secret")
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
  .argument("<variable_id>", "the ID of the environment variable to delete")
  .description("delete an environment variable")
  .action(deleteEnv);

const sshkeys = program.command("sshkeys").description("manage SSH keys");

sshkeys
  .command("put")
  .argument("<sandbox>", "the sandbox to put the SSH key in")
  .option("--private-key <path>", "the path to the SSH private key")
  .option("--public-key <path>", "the path to the SSH public key")
  .option("--generate, -g", "generate a new SSH key pair")
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
  .description("put a Tailscale Auth Key in the given sandbox")
  .action(putAuthKey);

tailscale
  .command("get")
  .argument("<sandbox>", "the sandbox to get the Tailscale Auth Key from")
  .description("get a Tailscale Auth Key (redacted) from the given sandbox")
  .action(getTailscaleAuthKey);

if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
