import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
const secret = randomBytes(32).toString("hex");
const result = spawnSync(
  process.execPath,
  [
    "node_modules/convex/bin/main.js",
    "env",
    "set",
    "KYC_FILE_PROXY_SECRET",
    "--",
    secret,
  ],
  { encoding: "utf8" },
);
if (result.status !== 0) {
  console.error("Could not configure the server file secret.");
  process.exit(1);
}
const env = readFileSync(".env.local", "utf8").replace(
  /^KYC_FILE_PROXY_SECRET=.*\r?\n?/m,
  "",
);
writeFileSync(
  ".env.local",
  env.trimEnd() + `\nKYC_FILE_PROXY_SECRET=${secret}\n`,
);
console.log(
  "Configured file proxy secret on this Next.js workspace and selected Convex deployment.",
);
