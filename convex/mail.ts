"use node";
import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { displayAnswer, text } from "../lib/kyc/model";

export const send = internalAction({
  args: { deliveryId: v.id("deliveries") },
  handler: async (ctx, { deliveryId }): Promise<void> => {
    if (!(await ctx.runMutation(internal.kyc.claimMail, { id: deliveryId })))
      return;
    const {
      delivery,
      submission: s,
      invitation: i,
    } = await ctx.runQuery(internal.kyc.mailData, { id: deliveryId });
    const name = displayAnswer(
      s.answers[i.tipo_persona === "Persona física" ? "pf_nombre" : "pm_razon"],
      s.language,
      "",
    );
    const values: Record<string, string> = {
      pf_nombre: i.tipo_persona === "Persona física" ? name : "",
      pm_razon: i.tipo_persona === "Persona moral" ? name : "",
      proyecto: i.proyecto,
      unidad: i.unidad,
      kyc_id: s.folio || "",
      pep: String(s.answers.pep || ""),
      or_forma: displayAnswer(s.answers.or_forma, "es", "or_forma"),
    };
    const interpolate = (str: string) =>
      str.replace(/\{(\w+)\}/g, (_, key) => values[key] || "");
    const recipients =
      delivery.kind === "buyer"
        ? [
            String(
              s.answers[
                i.tipo_persona === "Persona física" ? "pf_email" : "pm_email"
              ],
            ),
          ]
        : (process.env.KYC_NOTIFICATION_EMAILS || "")
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
    const from = process.env.KYC_EMAIL_FROM,
      key = process.env.RESEND_API_KEY,
      base = process.env.SITE_URL;
    if (!from || !key || !base || !recipients.length) {
      await ctx.runMutation(internal.kyc.completeMail, {
        id: deliveryId,
        sent: false,
        error: "EMAIL_NOT_CONFIGURED",
        transient: false,
      });
      return;
    }
    try {
      const { data, error } = await new Resend(key).emails.send(
        {
          from,
          to: recipients,
          subject: interpolate(
            text(
              delivery.kind === "buyer" ? "T10" : "T12",
              delivery.kind === "buyer" ? s.language : "es",
            ),
          ),
          text:
            delivery.kind === "buyer"
              ? interpolate(text("T11", s.language))
              : `${interpolate(text("T12", "es"))}\n\nConsultar expediente: ${base.replace(/\/$/, "")}/admin/kyc/${s._id}`,
        },
        { idempotencyKey: `kyc-${deliveryId}-${delivery.generation}` },
      );
      await ctx.runMutation(internal.kyc.completeMail, {
        id: deliveryId,
        sent: !error,
        providerId: data?.id,
        error: error?.name,
        transient:
          !!error &&
          [
            "application_error",
            "internal_server_error",
            "rate_limit_exceeded",
            "concurrent_idempotent_requests",
          ].includes(error.name),
      });
    } catch {
      await ctx.runMutation(internal.kyc.completeMail, {
        id: deliveryId,
        sent: false,
        error: "NETWORK_ERROR",
        transient: true,
      });
    }
  },
});
