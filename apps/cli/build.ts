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
  sourcemap: "linked",
});

const shebang = "#!/usr/bin/env -S node --enable-source-maps\n";

const content = fs.readFileSync(outfile, "utf-8");
fs.writeFileSync(outfile, shebang + content);

console.log(`✅ Built ${outfile} with shebang`);
