import {
  cyan,
  pkgx,
  magenta,
  brightGreen,
  TerminalSpinner,
  SpinnerTypes,
  green,
  decompress,
  generateName,
} from "../../deps.ts";
import { POCKETENV_CACHE_DIR } from "../consts.ts";
import { existsSync } from "node:fs";
import * as workspaces from "../workspaces.ts";
import { getDefaultGithubBranch } from "../lib.ts";

async function init(
  { template, standalone }: { template?: string; standalone?: boolean },
  name?: string
) {
  if (!name) {
    console.log(`${cyan("?")} Workspace name: `);

    while (!name || name === "") {
      name = await pkgx.run(`gum input --value ${generateName()}`, "piped");
      name = name.trim();
    }

    await Deno.stdout.write(new TextEncoder().encode(magenta(name) + "\n"));
  }
  if (!template) {
    console.log(`${cyan("?")} Choose a template: `);
    template = await pkgx.run(
      `gum choose pkgx nix devbox homebrew devenv flox`,
      "piped"
    );
    await Deno.stdout.write(new TextEncoder().encode(magenta(template)));
    template = template.trim();
  }

  await downloadFromGithub(template, standalone);

  await workspaces.save(Deno.cwd(), {
    containerId: null,
    name,
    path: Deno.cwd(),
    status: "Initialized",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log("Workspace successfully generated! 🚀");
  console.log(`Run ${brightGreen("`pocketenv up`")} to start the workspace.`);
}

async function downloadFromGithub(template: string, standalone?: boolean) {
  if (!standalone) {
    if (existsSync(".pocketenv")) {
      console.log(
        `🚨 ${brightGreen(
          ".pocketenv"
        )} directory already exists. Please remove it and try again.`
      );
      Deno.exit(1);
    }
  }
  const terminalSpinner = new TerminalSpinner({
    text: `Downloading ${green(template)} template ...`,
    spinner: SpinnerTypes.dots,
  });
  terminalSpinner.start();

  await Deno.mkdir(`${POCKETENV_CACHE_DIR}`, { recursive: true });

  const filePath = `${POCKETENV_CACHE_DIR}/${template.replaceAll(
    "/",
    "-"
  )}.zip`;

  const branch = await getDefaultGithubBranch(
    template.split("/").length === 2 ? template : `pocketenv-io/${template}`
  );

  const url =
    template.split("/").length === 2
      ? `https://codeload.github.com/${template}/zip/refs/heads/${branch}`
      : `https://codeload.github.com/pocketenv-io/${template}/zip/refs/heads/${branch}`;

  if (!existsSync(filePath)) {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    await Deno.writeFile(filePath, new Uint8Array(data));
  }

  terminalSpinner.succeed("Template downloaded successfully!");
  terminalSpinner.stop();

  const cacheDir = `${POCKETENV_CACHE_DIR}/${template}`;
  await Deno.mkdir(cacheDir, { recursive: true });

  if (!existsSync(`${cacheDir}/${template.split("/").pop()}-${branch}`)) {
    await decompress(filePath, cacheDir);
    await pkgx.run(
      `terraform init`,
      "inherit",
      `${cacheDir}/${template.split("/").pop()}-${branch}`
    );
  } else {
    console.log(
      `💾 Using cached template: ${brightGreen(template)} ${brightGreen("...")}`
    );
  }

  await copyDir(
    `${cacheDir}/${template.split("/").pop()}-${branch}`,
    standalone ? "." : ".pocketenv"
  );
}

async function copyDir(src: string, dest: string) {
  if (dest !== ".") {
    await Deno.mkdir(dest);
  }
  for await (const dirEntry of Deno.readDir(src)) {
    const srcPath = `${src}/${dirEntry.name}`;
    const destPath = `${dest}/${dirEntry.name}`;
    if (dirEntry.isDirectory) {
      await copyDir(srcPath, destPath);
    } else {
      await Deno.copyFile(srcPath, destPath);
    }
  }
}

export default init;
