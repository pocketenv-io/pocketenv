#!/usr/bin/env bun
import { build } from "bun";
import fs from "fs";

const outfile = "dist/index.js";

await build({
  entrypoints: ["./src/index.ts"],
  outdir: "dist",
  target: "node",
  format: "esm",
  minify: true,
});

const shebang = "#!/usr/bin/env node\n";

const content = fs.readFileSync(outfile, "utf-8");
fs.writeFileSync(outfile, shebang + content);

console.log(`✅ Built ${outfile} with shebang`);
