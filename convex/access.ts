import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import {
  PRIVACY_PATH,
  privacyProfile,
  completePrivacyProfile,
} from "../lib/kyc/privacy";

export function fail(code: string): never {
  throw new ConvexError(code);
}
export function allowedEmail(email: string | undefined) {
  return (
    !!email &&
    (process.env.KYC_STAFF_EMAILS || "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
      .includes(email.toLowerCase())
  );
}
export async function requireStaff(ctx: QueryCtx) {
  const id = await getAuthUserId(ctx);
  const user = id ? await ctx.db.get(id) : null;
  if (!id || !allowedEmail(user?.email)) return fail("UNAUTHORIZED");
  return id;
}
export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export async function requireInvitation(ctx: QueryCtx, token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return fail("INVALID_LINK");
  const hash = await hashToken(token);
  const invite = await ctx.db
    .query("invitations")
    .withIndex("by_token", (q) => q.eq("tokenHash", hash))
    .unique();
  if (!invite) return fail("INVALID_LINK");
  if (invite.revoked) return fail("REVOKED_LINK");
  if (invite.expiresAt <= Date.now()) return fail("EXPIRED_LINK");
  const submission = await ctx.db
    .query("submissions")
    .withIndex("by_invitation", (q) => q.eq("invitationId", invite._id))
    .unique();
  if (!submission) return fail("INVALID_LINK");
  return { invite, submission };
}
export function privacyUrl() {
  const url = process.env.KYC_PRIVACY_URL;
  if (!url || !/^https:\/\//.test(url) || url.includes("["))
    return fail("PRIVACY_NOT_CONFIGURED");
  try {
    if (
      new URL(url).pathname === PRIVACY_PATH &&
      !completePrivacyProfile(privacyProfile(process.env))
    )
      return fail("PRIVACY_NOT_CONFIGURED");
  } catch {
    return fail("PRIVACY_NOT_CONFIGURED");
  }
  return url;
}
