import { generateKeyPairSync } from "node:crypto";
import { spawnSync } from "node:child_process";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const values = {
  JWT_PRIVATE_KEY: privateKey
    .export({ type: "pkcs8", format: "pem" })
    .trimEnd()
    .replace(/\n/g, " "),
  JWKS: JSON.stringify({
    keys: [{ use: "sig", ...publicKey.export({ format: "jwk" }) }],
  }),
};
for (const [name, value] of Object.entries(values)) {
  const result = spawnSync(
    process.execPath,
    ["node_modules/convex/bin/main.js", "env", "set", name, "--", value],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    process.stderr.write(`Failed to configure ${name}. Check Convex access.\n`);
    process.exit(1);
  }
  process.stdout.write(`Configured ${name}.\n`);
}
