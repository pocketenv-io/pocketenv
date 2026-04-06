import { parse } from "@std/yaml";
import amp from "../presets/amp.yaml" with { type: "text" };
import claude from "../presets/claude.yaml" with { type: "text" };
import codex from "../presets/codex.yaml" with { type: "text" };
import copilot from "../presets/copilot.yaml" with { type: "text" };
import crush from "../presets/crush.yaml" with { type: "text" };
import cursor from "../presets/cursor.yaml" with { type: "text" };
import gemini from "../presets/gemini.yaml" with { type: "text" };
import kilo from "../presets/kilo.yaml" with { type: "text" };
import kiro from "../presets/kiro.yaml" with { type: "text" };
import mise from "../presets/mise.yaml" with { type: "text" };
import nix from "../presets/nix.yaml" with { type: "text" };
import nullclaw from "../presets/nullclaw.yaml" with { type: "text" };
import openclaw from "../presets/openclaw.yaml" with { type: "text" };
import opencode from "../presets/opencode.yaml" with { type: "text" };
import opencrust from "../presets/opencrust.yaml" with { type: "text" };
import picoclaw from "../presets/picoclaw.yaml" with { type: "text" };
import pkgx from "../presets/pkgx.yaml" with { type: "text" };
import wasmer from "../presets/wasmer.yaml" with { type: "text" };
import zeroclaw from "../presets/zeroclaw.yaml" with { type: "text" };
import chalk from "chalk";
import { BaseSandbox } from "../providers/mod.ts";
import { Preset, PresetSchema } from "../types/preset.ts";

const presets: Record<string, string> = {
  amp,
  claude,
  codex,
  copilot,
  crush,
  cursor,
  gemini,
  kilo,
  kiro,
  mise,
  nix,
  nullclaw,
  openclaw,
  opencode,
  opencrust,
  picoclaw,
  pkgx,
  wasmer,
  zeroclaw,
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
        if (exitCode === 0) {
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
      await sandbox.sh`${line}`;
    }
  }
}

export default prepareSandbox;
