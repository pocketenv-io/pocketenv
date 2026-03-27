import chalk from "chalk";
import { execSync } from "child_process";
import * as fs from "fs";

function detectLightTerminal(): boolean {
  // VS Code terminal
  const vscodeTheme = process.env.VSCODE_THEME_KIND;
  if (vscodeTheme) {
    return vscodeTheme === "vscode-light" || vscodeTheme === "vscode-high-contrast-light";
  }

  // COLORFGBG — set by xterm, iTerm2, etc. ("fg;bg", bg >= 8 = light)
  const colorfgbg = process.env.COLORFGBG;
  if (colorfgbg) {
    const parts = colorfgbg.split(";");
    const bg = parseInt(parts[parts.length - 1] ?? "", 10);
    if (!isNaN(bg)) return bg >= 8;
  }

  // OSC 11 background color query — works with Apple Terminal, iTerm2, etc.
  // stty is redirected from /dev/tty explicitly because execSync pipes stdio,
  // which means stty would otherwise fail to find the terminal.
  if (process.stdout.isTTY) {
    try {
      const savedState = execSync("stty -g </dev/tty 2>/dev/null", { encoding: "utf8" }).trim();
      // If we couldn't save the state, skip to avoid leaving the terminal in raw mode.
      if (!savedState) return false;
      const tty = fs.openSync("/dev/tty", "r+");
      try {
        // Use -icanon -echo instead of raw: avoids disabling ISIG (Ctrl+C) so
        // signal handling stays intact even if the restore below fails.
        execSync("stty -icanon -echo min 0 time 2 </dev/tty 2>/dev/null");
        fs.writeSync(tty, "\x1b]11;?\x07");
        // Read in a loop until we see the response terminator (BEL or ST),
        // so leftover bytes don't leak into the terminal input buffer.
        let resp = "";
        const buf = Buffer.alloc(64);
        for (let i = 0; i < 16; i++) {
          const n = fs.readSync(tty, buf, 0, 64, null);
          if (n === 0) break;
          resp += buf.slice(0, n).toString();
          if (resp.includes("\x07") || resp.includes("\x1b\\")) break;
        }
        const m = resp.match(/rgb:([0-9a-f]+)\/([0-9a-f]+)\/([0-9a-f]+)/i);
        if (m?.[1] && m[2] && m[3]) {
          // Components can be 2 or 4 hex digits; normalize to 0-255
          const norm = (h: string) => parseInt(h.slice(0, 2), 16);
          const r = norm(m[1]), g = norm(m[2]), b = norm(m[3]);
          return 0.299 * r + 0.587 * g + 0.114 * b > 127;
        }
      } finally {
        try { fs.closeSync(tty); } catch {}
        try { execSync(`stty ${savedState} </dev/tty 2>/dev/null`); } catch {}
      }
    } catch {}
  }

  return false;
}

const isLightTerminal = detectLightTerminal();

export const c = {
  primary: (s: string | number) => chalk.rgb(0, 232, 198)(s),
  secondary: (s: string | number) => chalk.rgb(0, 198, 232)(s),
  accent: (s: string | number) => chalk.rgb(130, 100, 255)(s),
  highlight: (s: string | number) => chalk.rgb(100, 232, 130)(s),
  muted: (s: string | number) => isLightTerminal ? chalk.black(s) : chalk.rgb(200, 210, 220)(s),
  link: (s: string | number) => chalk.rgb(255, 160, 100)(s),
  sky: (s: string | number) => chalk.rgb(0, 210, 255)(s),
  error: (s: string | number) => chalk.rgb(255, 100, 100)(s),
};
