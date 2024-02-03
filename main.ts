import { Command, brightGreen } from "./deps.ts";
import down from "./src/cmd/down.ts";
import init from "./src/cmd/init.ts";
import server from "./src/cmd/server.ts";
import status from "./src/cmd/status.ts";
import up from "./src/cmd/up.ts";
import { VERSION } from "./src/consts.ts";

async function main() {
  await new Command()
    .name("pocketenv")
    .version(VERSION)
    .description(
      brightGreen(`
.
     ____             __        __                 
    / __ \\____  _____/ /_____  / /____  ____ _   __
   / /_/ / __ \\/ ___/ //_/ _ \\/ __/ _ \\/ __ \\ | / /
  / ____/ /_/ / /__/ ,< /  __/ /_/  __/ / / / |/ / 
 /_/    \\____/\\___/_/|_|\\___/\\__/\\___/_/ /_/|___/  
  
  https://pocketenv.io - Manage your development environment with ease.
    `)
    )
    .command("init", "Generate a new Pocketenv workspace")
    .arguments("[name:string]")
    .option(
      "-t, --template <template:string>",
      "Create a workspace from a template"
    )
    .action(function (options, name) {
      init(options, name);
    })
    .command("up", "Start the Pocketenv workspace")
    .arguments("[workspace:string]")
    .option("--ask", "Ask before creating the workspace")
    .option(
      "-t, --template <template:string>",
      "Create and start a workspace from a template"
    )
    .action(async function (options, workspace) {
      await up(options, workspace);
    })
    .command("down", "Stop the Pocketenv workspace")
    .arguments("[workspace:string]")
    .option("--ask", "Ask before destroying the workspace")
    .action(async function (options, workspace) {
      await down(options, workspace);
    })
    .command("list", "List all Pocketenv workspaces")
    .command("publish", "Publish a Pocketenv workspace as a template")
    .command("search", "Search for a Pocketenv workspace")
    .command("status", "Get the status of the Pocketenv workspace")
    .arguments("[workspace:string]")
    .action(async function (_options, workspace) {
      await status(workspace);
    })
    .command("server", "Start the Pocketenv server")
    .option("-p, --port <port:number>", "Port to start the server on")
    .action(async function (options) {
      await server(options);
    })
    .parse(Deno.args);
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  await main();
}
