import {
  cyan,
  pkgx,
  magenta,
  brightGreen,
  TerminalSpinner,
  SpinnerTypes,
  green,
  decompress,
} from "../../deps.ts";
import { POCKETENV_CACHE_DIR } from "../consts.ts";
import { existsSync } from "node:fs";

async function init({ template }: { template?: string }, name?: string) {
  const cwd = Deno.cwd().split("/").pop();

  if (!name) {
    console.log(`${cyan("?")} Workspace name: `);

    while (!name || name === "") {
      name = await pkgx.run(`gum input --value ${cwd}`, "piped");
      name = name.trim();
    }

    await Deno.stdout.write(new TextEncoder().encode(magenta(name) + "\n"));
  }
  if (!template) {
    console.log(`${cyan("?")} Choose a template: `);
    template = await pkgx.run(
      `gum choose pkgx nix devbox homebrew devenv`,
      "piped"
    );
    await Deno.stdout.write(new TextEncoder().encode(magenta(template)));
    template = template.trim();
  }

  await downloadFromGithub(template);

  console.log("Workspace successfully generated! 🚀");
  console.log(`Run ${brightGreen("`pocketenv up`")} to start the workspace.`);
}

async function downloadFromGithub(template: string) {
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

  const url =
    template.split("/").length === 2
      ? `https://codeload.github.com/${template}/zip/refs/heads/main`
      : `https://codeload.github.com/pocketenv-io/${template}/zip/refs/heads/main`;

  if (!existsSync(filePath)) {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    await Deno.writeFile(filePath, new Uint8Array(data));
  }

  terminalSpinner.succeed("Template downloaded successfully!");
  terminalSpinner.stop();

  const cacheDir = `${POCKETENV_CACHE_DIR}/${template}`;
  await Deno.mkdir(cacheDir, { recursive: true });

  if (!existsSync(`${cacheDir}/${template.split("/").pop()}-main`)) {
    await decompress(filePath, cacheDir);
    await pkgx.run(
      `terraform init`,
      "inherit",
      `${cacheDir}/${template.split("/").pop()}-main`
    );
  }

  await copyDir(`${cacheDir}/${template.split("/").pop()}-main`, `.`);
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
