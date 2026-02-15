import chalk from "chalk";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { $ } from "zx";
import { consola } from "consola";

function getPklFilesRecursive(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...getPklFilesRecursive(fullPath));
      continue;
    }

    if (entry.endsWith(".pkl")) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = getPklFilesRecursive(join("pkl", "defs"));

await Promise.all(
  files.map(async (fullPath) => {
    consola.info(`pkl eval ${chalk.cyan(fullPath)}`);
    await $`pkl eval -f json ${fullPath} > ${fullPath.replace(/\.pkl$/, ".json").replace(/pkl[\\\/]defs/g, "lexicons")}`;
  }),
);
