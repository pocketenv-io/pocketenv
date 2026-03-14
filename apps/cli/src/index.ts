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
${chalk.bold("\nLearn more about Pocketenv:")}               https://docs.pocketenv.io
${chalk.bold("Join our Discord community:")}           ${chalk.blueBright("https://discord.gg/9ada4pFUFS")}
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
  .argument("[name]", "the name of the sandbox to create")
  .description("create a new sandbox")
  .action(createSandbox);

program
  .command("logout")
  .description("logout (removes session token)")
  .action(logout);

if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
