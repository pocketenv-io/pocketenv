import { parse } from "@std/yaml";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { BaseSandbox } from "../providers";
import { type Preset, PresetSchema } from "../types/preset";
import { consola } from "consola";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readPreset(name: string): string {
  return readFileSync(join(__dirname, `../presets/${name}.yaml`), "utf-8");
}

const presets: Record<string, string> = {
  amp: readPreset("amp"),
  claude: readPreset("claude"),
  codex: readPreset("codex"),
  copilot: readPreset("copilot"),
  crush: readPreset("crush"),
  cursor: readPreset("cursor"),
  gemini: readPreset("gemini"),
  kilo: readPreset("kilo"),
  kiro: readPreset("kiro"),
  mise: readPreset("mise"),
  nix: readPreset("nix"),
  nullclaw: readPreset("nullclaw"),
  openclaw: readPreset("openclaw"),
  opencode: readPreset("opencode"),
  opencrust: readPreset("opencrust"),
  picoclaw: readPreset("picoclaw"),
  pkgx: readPreset("pkgx"),
  wasmer: readPreset("wasmer"),
  zeroclaw: readPreset("zeroclaw"),
};

async function prepareSandbox(sandbox: BaseSandbox, base: string) {
  if (!presets[base]) {
    console.warn(
      chalk.yellow(
        `No preset found for base "${base}". Skipping sandbox preparation.`,
      ),
    );
    return;
  }

  const preset = parse(presets[base]) as Preset;
  PresetSchema.parse(preset); // Validate preset structure

  for (const item of preset) {
    console.info(`${chalk.rgb(0, 232, 198)(item.name)}`);

    if (item.if) {
      try {
        const { exitCode } = await sandbox.sh`${item.if}`;
        if (exitCode !== 0) {
          console.info(
            chalk.yellow(
              `Condition "${chalk.rgb(100, 232, 130)(item.if)}" met. Skipping commands for "${chalk.rgb(100, 232, 130)(item.name)}".`,
            ),
          );
          continue;
        }
      } catch {
        // If the command fails, we assume the condition is not met and proceed with the commands.
      }
    }

    for (const line of item.run.trim().split("\n")) {
      console.log(`${chalk.rgb(100, 232, 130)("exec")}  ${line}`);
      const result = await sandbox.sh`${line}`;
      if (result.exitCode !== 0) {
        consola.warn(
          `Command "${chalk.rgb(100, 232, 130)(line)}" failed with exit code ${result.exitCode} ${result.stderr} ${result.stdout}.`,
        );
      }
    }
  }
}

export default prepareSandbox;
