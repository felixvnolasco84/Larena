// Configure an existing production deployment without exposing credentials.
// The output file is ignored and is not loaded automatically by Next.js.
import { generateKeyPairSync, randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const cli = "node_modules/convex/bin/main.js";
const publicUrl = process.argv[2];
if (!publicUrl || !/^https:\/\/[a-z0-9-]+\.convex\.cloud$/.test(publicUrl))
  throw new Error("Pass the production Convex URL as the first argument");
const prodArgs = ["--deployment", new URL(publicUrl).hostname.split(".")[0]];
function convex(args) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Convex command failed: ${args.slice(0, 2).join(" ")}`);
  return result.stdout.trim();
}
const output = ".env.kyc-production.local";
const existing = new Set(convex(["env", "list", "--names-only", ...prodArgs]).split(/\r?\n/));
const profile = ["KYC_STAFF_EMAILS", "KYC_CONTROLLER_NAME", "KYC_CONTROLLER_ADDRESS", "KYC_PRIVACY_EMAIL", "RESEND_API_KEY", "KYC_EMAIL_FROM", "KYC_NOTIFICATION_EMAILS"];
const settings = Object.fromEntries(profile.map(name => [name, convex(["env", "get", name])]));
settings.SITE_URL = "https://www.larena.mx";
settings.KYC_PRIVACY_URL = `${settings.SITE_URL}/kyc/aviso-privacidad`;
for (const [name, value] of Object.entries(settings)) {
  if (!value) throw new Error(`Missing configuration: ${name}`);
  convex(["env", "set", name, ...prodArgs, "--", value]);
  console.log(`Configured production ${name}`);
}
if (!existing.has("JWT_PRIVATE_KEY") && !existing.has("JWKS")) {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ format: "pem", type: "pkcs8" }).toString().trimEnd().replace(/\n/g, " ");
  const jwks = JSON.stringify({ keys: [publicKey.export({ format: "jwk" })] });
  convex(["env", "set", "JWT_PRIVATE_KEY", ...prodArgs, "--", pem]);
  convex(["env", "set", "JWKS", ...prodArgs, "--", jwks]);
  console.log("Configured separate production signing keys");
} else if (!existing.has("JWT_PRIVATE_KEY") || !existing.has("JWKS")) {
  throw new Error("Production signing key configuration is incomplete; existing keys were preserved");
}
let proxy;
if (existing.has("KYC_FILE_PROXY_SECRET")) {
  proxy = convex(["env", "get", "KYC_FILE_PROXY_SECRET", ...prodArgs]);
} else {
  proxy = randomBytes(32).toString("hex");
  convex(["env", "set", "KYC_FILE_PROXY_SECRET", ...prodArgs, "--", proxy]);
}
const hostSettings = {
  NEXT_PUBLIC_CONVEX_URL: publicUrl,
  NEXT_PUBLIC_CONVEX_SITE_URL: publicUrl.replace(".convex.cloud", ".convex.site"),
  KYC_FILE_PROXY_SECRET: proxy,
  ...Object.fromEntries(profile.filter(name => name.startsWith("KYC_CONTROLLER") || name === "KYC_PRIVACY_EMAIL").map(name => [name, settings[name]])),
};
writeFileSync(output, Object.entries(hostSettings).map(([name, value]) => `${name}=${JSON.stringify(value)}`).join("\n") + "\n", { mode: 0o600 });
console.log(`Saved hosting settings privately to ${output}`);
