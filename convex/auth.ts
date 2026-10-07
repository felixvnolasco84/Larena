import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend } from "resend";
import { allowedEmail, fail } from "./access";

const ResendOTP = Email({
  id: "resend-otp",
  maxAge: 15 * 60,
  normalizeIdentifier(identifier) {
    const email = identifier.trim().toLowerCase();
    if (!allowedEmail(email)) return fail("UNAUTHORIZED");
    return email;
  },
  async generateVerificationToken() {
    // Rejection sampling avoids modulo bias for an eight digit OTP.
    let code = "";
    while (code.length < 8)
      for (const b of crypto.getRandomValues(new Uint8Array(16)))
        if (b < 250 && code.length < 8) code += b % 10;
    return code;
  },
  async sendVerificationRequest({ identifier, token }) {
    if (!allowedEmail(identifier)) return fail("UNAUTHORIZED");
    if (!process.env.KYC_EMAIL_FROM || !process.env.RESEND_API_KEY)
      return fail("EMAIL_NOT_CONFIGURED");
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.KYC_EMAIL_FROM,
      to: identifier,
      subject: "LARENA · Acceso al panel KYC",
      text: `Tu código de acceso es ${token}. Expira en 15 minutos.`,
    });
    if (error) return fail("EMAIL_UNAVAILABLE");
  },
});
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ResendOTP],
  callbacks: {
    async beforeSessionCreation(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (!allowedEmail(user?.email)) fail("UNAUTHORIZED");
    },
  },
});
