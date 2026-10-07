import { beforeEach, describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../convex/schema";
import { internal } from "../convex/_generated/api";

const send = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));
const modules = import.meta.glob("../convex/**/!(*.*.*)*.*s");

describe("KYC email transport", () => {
  beforeEach(() => {
    send.mockReset().mockResolvedValue({ data: { id: "test-email" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("KYC_EMAIL_FROM", "OGC <kyc@example.test>");
    vi.stubEnv("KYC_NOTIFICATION_EMAILS", "staff@example.test");
    vi.stubEnv("SITE_URL", "https://larena.example.test/");
  });

  it.each(["es", "en"] as const)(
    "sends the %s buyer receipt and the Spanish internal notification once",
    async (language) => {
      const t = convexTest(schema, modules);
      const { submissionId, deliveries } = await t.run(async (ctx) => {
        const createdBy = await ctx.db.insert("users", { email: "staff@example.test" });
        const invitationId = await ctx.db.insert("invitations", {
          createdBy,
          tipo_persona: "Persona física",
          origen_comprador: "Mexicana",
          proyecto: "Larena",
          unidad: "TEST-EMAIL",
          asesor: "Test",
          tokenHash: "a".repeat(64),
          revoked: false,
          expiresAt: Date.now() + 86400000,
        });
        const submissionId = await ctx.db.insert("submissions", {
          invitationId,
          proyecto: "Larena",
          searchText: "TEST-EMAIL KYC-LAR-0001",
          status: "enviado",
          answers: {
            pf_nombre: { first: "Prueba", last: "Correo", second: "" },
            pf_email: "buyer@example.test",
            pep: "No",
            or_forma: ["Transferencia"],
          },
          language,
          folio: "KYC-LAR-0001",
          step: 6,
          revision: 1,
          version: "test",
          updatedAt: Date.now(),
        });
        const deliveries = [];
        for (const kind of ["buyer", "internal"] as const)
          deliveries.push(await ctx.db.insert("deliveries", {
            submissionId,
            kind,
            status: "pending",
            attempts: 0,
            generation: 0,
            updatedAt: Date.now(),
          }));
        return { submissionId, deliveries };
      });
      for (const deliveryId of deliveries) {
        await t.action(internal.mail.send, { deliveryId });
        await t.action(internal.mail.send, { deliveryId });
        expect(await t.run((ctx) => ctx.db.get(deliveryId))).toMatchObject({
          status: "sent", attempts: 1, providerId: "test-email",
        });
      }
      expect(send).toHaveBeenCalledTimes(2);
      const [buyer, notification] = send.mock.calls;
      expect(buyer[0].to).toEqual(["buyer@example.test"]);
      expect(buyer[0].subject).toContain(language === "en" ? "We received" : "Recibimos");
      expect(buyer[0].text).toContain("KYC-LAR-0001");
      expect(notification[0].to).toEqual(["staff@example.test"]);
      expect(notification[0].subject).toContain("Nuevo KYC: Larena TEST-EMAIL");
      expect(notification[0].text).toContain(`https://larena.example.test/admin/kyc/${submissionId}`);
      expect(notification[0]).not.toHaveProperty("attachments");
      expect(notification[1]).toEqual({ idempotencyKey: `kyc-${deliveries[1]}-0` });
    },
  );
});
