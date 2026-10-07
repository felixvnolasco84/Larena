import { describe, it, expect, beforeEach, vi } from "vitest";
import { convexTest } from "convex-test";
import { api, internal } from "../convex/_generated/api";
import schema from "../convex/schema";
import {
  fields,
  visible,
  kind,
  options,
  validate,
  sanitize,
  fileRule,
  validateFile,
  VERSION,
  type Answers,
  type BuyerContext,
  type FileInfo,
} from "../lib/kyc/model";
import { hashToken, privacyUrl } from "../convex/access";
import type { Id } from "../convex/_generated/dataModel";
const modules = import.meta.glob("../convex/**/!(*.*.*)*.*s");
const token = "a".repeat(64);
const pf: BuyerContext = {
  tipo_persona: "Persona física",
  origen_comprador: "Extranjera",
};
function filled(context: BuyerContext, extra: Answers = {}) {
  const a: Answers = {
    bc_cuenta_propia: "Sí",
    bc_existe: "No",
    or_titular: "Sí",
    pep: "No",
    pep_familiar: "No",
    ...extra,
  };
  for (const f of fields.filter((f) => visible(f, context, a))) {
    if (a[f.id] !== undefined) continue;
    const k = kind(f);
    if (k === "name") a[f.id] = { first: "Test", last: "Buyer", second: "" };
    else if (k === "check") a[f.id] = true;
    else if (k === "radio") a[f.id] = options(f.id, "es")[0].value;
    else if (k === "multi") a[f.id] = [options(f.id, "es")[0].value];
    else if (k === "country") a[f.id] = "US";
    else if (k === "phone") a[f.id] = "+1 555 123 4567";
    else if (k === "email") a[f.id] = "buyer@example.test";
    else if (["text", "textarea"].includes(k))
      a[f.id] = "Synthetic test information for the purchase";
  }
  return a;
}
function requiredFiles(context: BuyerContext, a: Answers): FileInfo[] {
  return fields
    .filter(
      (f) =>
        visible(f, context, a) &&
        f.required &&
        ["file", "signature"].includes(kind(f)),
    )
    .map((f) => ({
      _id: f.id,
      field: f.id,
      name: f.id + ".pdf",
      size: 1,
      contentType: "application/pdf",
    }));
}
describe("Excel rules", () => {
  it.each(["Persona física", "Persona moral"] as const)(
    "validates both origins for %s",
    (tipo_persona) => {
      for (const origen_comprador of ["Mexicana", "Extranjera"] as const) {
        const c = { tipo_persona, origen_comprador },
          a = filled(c);
        expect(validate(c, a, requiredFiles(c, a), "es")).toEqual({});
        expect(
          fields
            .filter((f) => visible(f, c, a))
            .some((f) =>
              f.id.startsWith(
                tipo_persona === "Persona física" ? "pm_" : "pf_",
              ),
            ),
        ).toBe(false);
      }
    },
  );
  it("covers beneficiary OR logic, PEP, cash and a third-party account", () => {
    const a = filled(pf, {
      bc_cuenta_propia: "No",
      bc_existe: "No",
      pep: "Sí",
      pep_familiar: "Sí",
      or_titular: "No",
      or_forma: ["Efectivo"],
    });
    for (const id of [
      "bc_nombre",
      "doc_bc_id",
      "pep_cargo",
      "pep_fam_detalle",
      "or_titular_nombre",
      "or_aviso_efectivo",
    ])
      expect(
        visible(
          fields.find((f) => f.id === id)!,
          pf,
          a,
        ),
      ).toBe(true);
    expect(validate(pf, a, requiredFiles(pf, a), "en")).toEqual({});
    expect(
      validate(pf, { ...a, or_detalle: "short" }, requiredFiles(pf, a), "en")
        .or_detalle,
    ).toContain("20");
    expect(
      validate(
        pf,
        { ...a, pf_telefono: "+1........" },
        requiredFiles(pf, a),
        "es",
      ).pf_telefono,
    ).toBeTruthy();
  });
  it("removes hidden, internal and unknown fields", () => {
    const clean = sanitize(pf, {
      ...filled(pf),
      pep_cargo: "hidden",
      pm_razon: "hidden",
      pf_rfc: "internal",
      unexpected: "unknown",
    });
    for (const id of ["pep_cargo", "pm_razon", "pf_rfc", "unexpected"])
      expect(clean).not.toHaveProperty(id);
    expect(
      fields.filter((f) => !["heading", "paragraph"].includes(kind(f))),
    ).toHaveLength(51);
  });
  it("respects 25 MB PDFs, restricted HEIC and file counts", () => {
    expect(fileRule("doc_acta").maxBytes).toBe(25 * 1024 ** 2);
    expect(fileRule("doc_id").count).toBe(2);
    expect(fileRule("doc_origen").count).toBe(3);
    expect(
      validateFile("doc_acta", {
        name: "act.pdf",
        size: 25 * 1024 ** 2,
        contentType: "application/pdf",
      }),
    ).toBe(true);
    expect(
      validateFile("doc_acta", {
        name: "act.pdf",
        size: 25 * 1024 ** 2 + 1,
        contentType: "application/pdf",
      }),
    ).toBe(false);
    expect(
      validateFile("doc_id", {
        name: "photo.heic",
        size: 10,
        contentType: "image/heic",
      }),
    ).toBe(true);
    expect(
      validateFile("doc_id_rl", {
        name: "photo.heic",
        size: 10,
        contentType: "image/heic",
      }),
    ).toBe(false);
    expect(
      validateFile("doc_acta", {
        name: "evil.pdf",
        size: 10,
        contentType: "text/html",
      }),
    ).toBe(false);
  });
});
function backend() {
  return convexTest(schema, modules);
}
// convex-test's storeBlob mock omits contentType; real HTTP uploads persist it.
async function stored(t: ReturnType<typeof backend>, type: string) {
  return t.run(async (ctx) => {
    const id = await ctx.storage.store(new Blob(["test"], { type }));
    const systemWriter = ctx.db as unknown as {
      patch: (
        id: Id<"_storage">,
        value: { contentType: string },
      ) => Promise<void>;
    };
    await systemWriter.patch(id, { contentType: type });
    return id;
  });
}
async function seed(
  t: ReturnType<typeof backend>,
  c: BuyerContext = pf,
  a: Answers = {},
) {
  const tokenHash = await hashToken(token);
  return t.run(async (ctx) => {
    const createdBy = await ctx.db.insert("users", {
      email: "staff@example.test",
    });
    const invitationId = await ctx.db.insert("invitations", {
      ...c,
      proyecto: "Larena",
      unidad: "TEST-302",
      asesor: "Test",
      createdBy,
      tokenHash,
      revoked: false,
      expiresAt: Date.now() + 86400000,
    });
    const id = await ctx.db.insert("submissions", {
      invitationId,
      proyecto: "Larena",
      searchText: "TEST-302",
      answers: a,
      language: "es",
      step: 0,
      revision: 0,
      status: "borrador",
      updatedAt: Date.now(),
      version: VERSION,
    });
    return { id, invitationId, createdBy };
  });
}
beforeEach(() => {
  vi.stubEnv("KYC_STAFF_EMAILS", "staff@example.test");
  vi.stubEnv("KYC_PRIVACY_URL", "https://example.test/kyc-privacy");
  vi.stubEnv("KYC_FILE_PROXY_SECRET", "test-server-only-secret");
});
describe("Convex authorization and persistence", () => {
  it("keeps the native notice unavailable until the controller profile is complete", () => {
    vi.stubEnv("KYC_PRIVACY_URL", "https://www.larena.mx/kyc/aviso-privacidad");
    vi.stubEnv("KYC_CONTROLLER_NAME", "");
    vi.stubEnv("KYC_CONTROLLER_ADDRESS", "");
    vi.stubEnv("KYC_PRIVACY_EMAIL", "");
    expect(() => privacyUrl()).toThrow("PRIVACY_NOT_CONFIGURED");
    vi.stubEnv("KYC_CONTROLLER_NAME", "Synthetic QA Controller");
    vi.stubEnv("KYC_CONTROLLER_ADDRESS", "Synthetic QA address, Mexico");
    vi.stubEnv("KYC_PRIVACY_EMAIL", "privacy@example.test");
    expect(privacyUrl()).toBe("https://www.larena.mx/kyc/aviso-privacidad");
  });
  it("creates hash-only 30-day invitations and invalidates a replaced link", async () => {
    const t = backend(),
      s = await seed(t),
      staff = t.withIdentity({ subject: s.createdBy });
    const args = {
      ...pf,
      proyecto: "Larena",
      unidad: " TEST-404 ",
      asesor: "Test",
      prefilled: {
        pf_email: "buyer@example.test",
        pm_razon: "hidden",
        pep_cargo: "internal",
      },
    };
    await expect(t.action(api.kyc.createInvitation, args)).rejects.toThrow(
      "UNAUTHORIZED",
    );
    const before = Date.now(),
      created = await staff.action(api.kyc.createInvitation, args);
    expect(created.token).toMatch(/^[a-f0-9]{64}$/);
    const detail = await staff.query(api.kyc.detail, { id: created.id });
    expect(detail.invitation.tokenHash).toBe(await hashToken(created.token));
    expect(detail.invitation).not.toHaveProperty("token");
    expect(detail.invitation.expiresAt - before).toBeGreaterThanOrEqual(
      30 * 86400000,
    );
    expect(detail.submission.answers).toEqual({
      pf_email: "buyer@example.test",
    });
    expect(detail.invitation.unidad).toBe("TEST-404");
    const replacement = await staff.action(api.kyc.regenerate, {
      id: created.id,
    });
    expect((await t.query(api.kyc.get, { token: created.token })).status).toBe(
      "error",
    );
    expect((await t.query(api.kyc.get, { token: replacement })).status).toBe(
      "borrador",
    );
    await staff.mutation(api.kyc.revoke, { id: created.id });
    expect(await t.query(api.kyc.get, { token: replacement })).toMatchObject({
      status: "error",
      code: "REVOKED_LINK",
    });
    vi.stubEnv("KYC_PRIVACY_URL", "");
    await expect(
      staff.action(api.kyc.createInvitation, args),
    ).rejects.toThrow();
  });
  it("finds matching units beyond the first page and applies project/state filters", async () => {
    const t = backend(),
      s = await seed(t),
      staff = t.withIdentity({ subject: s.createdBy });
    await t.run(async (ctx) => {
      await ctx.db.patch(s.id, {
        searchText: "TARGET-404 KYC-LAR-0042",
        folio: "KYC-LAR-0042",
        status: "enviado",
      });
      for (let i = 0; i < 25; i++)
        await ctx.db.insert("submissions", {
          invitationId: s.invitationId,
          proyecto: "Otro",
          searchText: `RECENT-${i}`,
          answers: {},
          language: "es",
          step: 0,
          revision: 0,
          status: "borrador",
          updatedAt: Date.now(),
          version: VERSION,
        });
    });
    const filtered = await staff.query(api.kyc.list, {
      paginationOpts: { numItems: 20, cursor: null },
      search: "TARGET-404",
      project: "Larena",
      status: "enviado",
    });
    expect(filtered.page.map((s) => s.id)).toEqual([s.id]);
    const folio = await staff.query(api.kyc.list, {
      paginationOpts: { numItems: 20, cursor: null },
      search: "KYC-LAR-0042",
    });
    expect(folio.page.map((s) => s.id)).toEqual([s.id]);
    const drafts = await staff.query(api.kyc.list, {
      paginationOpts: { numItems: 20, cursor: null },
      project: "Otro",
      status: "borrador",
    });
    expect(drafts.page).toHaveLength(20);
    expect(drafts.isDone).toBe(false);
  });
  it("rejects invalid, expired and revoked links", async () => {
    const t = backend(),
      s = await seed(t);
    expect((await t.query(api.kyc.get, { token: "bad" })).status).toBe("error");
    await t.run((ctx) => ctx.db.patch(s.invitationId, { revoked: true }));
    expect(await t.query(api.kyc.get, { token })).toMatchObject({
      status: "error",
      code: "REVOKED_LINK",
    });
    await t.run((ctx) =>
      ctx.db.patch(s.invitationId, { revoked: false, expiresAt: 0 }),
    );
    expect(await t.query(api.kyc.get, { token })).toMatchObject({
      status: "error",
      code: "EXPIRED_LINK",
    });
    await expect(
      t.mutation(api.kyc.saveDraft, {
        token,
        answers: {},
        language: "es",
        step: 0,
        revision: 0,
      }),
    ).rejects.toThrow();
  });
  it("retains bilingual drafts and detects changes from another device", async () => {
    const t = backend();
    await seed(t);
    expect(
      await t.mutation(api.kyc.saveDraft, {
        token,
        answers: { pf_email: "test@example.test", pm_razon: "hidden" },
        language: "en",
        step: 1,
        revision: 0,
      }),
    ).toBe(1);
    const saved = await t.query(api.kyc.get, { token });
    expect(saved.status).toBe("borrador");
    if (saved.status === "borrador")
      expect(saved.submission).toMatchObject({
        language: "en",
        step: 1,
        answers: { pf_email: "test@example.test" },
      });
    await expect(
      t.mutation(api.kyc.saveDraft, {
        token,
        answers: {},
        language: "es",
        step: 0,
        revision: 0,
      }),
    ).rejects.toThrow("DRAFT_CONFLICT");
  });
  it("requires authorized staff on admin operations", async () => {
    const t = backend(),
      s = await seed(t);
    await expect(t.query(api.kyc.detail, { id: s.id })).rejects.toThrow(
      "UNAUTHORIZED",
    );
    const staff = t.withIdentity({ subject: s.createdBy });
    expect(await staff.query(api.kyc.staff, {})).toBe(true);
    expect(
      (await staff.query(api.kyc.detail, { id: s.id })).submission._id,
    ).toBe(s.id);
    vi.stubEnv("KYC_STAFF_EMAILS", "");
    expect(await staff.query(api.kyc.staff, {})).toBe(false);
    await expect(staff.mutation(api.kyc.revoke, { id: s.id })).rejects.toThrow(
      "UNAUTHORIZED",
    );
  });
  it("registers validated uploads once and denies foreign file access", async () => {
    const t = backend(),
      s = await seed(t);
    const grant = await t.mutation(api.kyc.generateUpload, {
      token,
      field: "doc_id",
      name: "id.pdf",
      size: 4,
      contentType: "application/pdf",
    });
    const storageId = await stored(t, "application/pdf");
    const id = await t.mutation(api.kyc.registerUpload, {
      token,
      grantId: grant.grantId,
      storageId,
    });
    await expect(
      t.mutation(api.kyc.registerUpload, {
        token,
        grantId: grant.grantId,
        storageId,
      }),
    ).rejects.toThrow("INVALID_UPLOAD");
    await expect(
      t.query(api.kyc.fileSource, { id, token, proxyKey: "incorrect" }),
    ).rejects.toThrow("UNAUTHORIZED");
    await expect(
      t.query(api.kyc.fileSource, { id, proxyKey: "test-server-only-secret" }),
    ).rejects.toThrow("UNAUTHORIZED");
    expect(
      (
        await t.query(api.kyc.fileSource, {
          id,
          token,
          proxyKey: "test-server-only-secret",
        })
      ).name,
    ).toBe("id.pdf");
    const foreign = await t.run(async (ctx) => {
      const invite = await ctx.db.insert("invitations", {
        ...pf,
        proyecto: "Larena",
        unidad: "OTHER",
        asesor: "Test",
        createdBy: s.createdBy,
        tokenHash: "b".repeat(64),
        revoked: false,
        expiresAt: Date.now() + 86400000,
      });
      const other = await ctx.db.insert("submissions", {
        invitationId: invite,
        proyecto: "Larena",
        searchText: "OTHER",
        status: "borrador",
        answers: {},
        language: "es",
        step: 0,
        revision: 0,
        version: VERSION,
        updatedAt: Date.now(),
      });
      return ctx.db.insert("files", {
        submissionId: other,
        field: "doc_id",
        name: "other.pdf",
        size: 4,
        contentType: "application/pdf",
        storageId,
      });
    });
    await expect(
      t.query(api.kyc.fileSource, {
        id: foreign,
        token,
        proxyKey: "test-server-only-secret",
      }),
    ).rejects.toThrow("UNAUTHORIZED");
    await expect(
      t.mutation(api.kyc.removeFile, { id: foreign, token }),
    ).rejects.toThrow("UNAUTHORIZED");
  });
  it("rejects incomplete submissions and finalizes atomically only once", async () => {
    const t = backend(),
      s = await seed(t);
    await expect(
      t.mutation(api.kyc.submit, { token, confirmations: {} }),
    ).rejects.toThrow();
    const a = filled(pf);
    await t.mutation(api.kyc.saveDraft, {
      token,
      answers: a,
      language: "en",
      step: 6,
      revision: 0,
    });
    for (const f of requiredFiles(pf, a)) {
      const signature = f.field === "firma";
      const storageId = await stored(
        t,
        signature ? "image/png" : "application/pdf",
      );
      await t.run((ctx) =>
        ctx.db.insert("files", {
          submissionId: s.id,
          field: f.field,
          name: signature ? "firma.png" : f.name,
          storageId,
          size: 4,
          contentType: signature ? "image/png" : "application/pdf",
        }),
      );
    }
    await expect(
      t.mutation(api.kyc.submit, {
        token,
        confirmations: { pf_email: "mismatch@example.test" },
      }),
    ).rejects.toThrow();
    const first = await t.mutation(api.kyc.submit, {
        token,
        confirmations: { pf_email: String(a.pf_email) },
      }),
      second = await t.mutation(api.kyc.submit, { token, confirmations: {} });
    expect(first).toBe("KYC-LAR-0001");
    expect(second).toBe(first);
    expect(
      await t.run((ctx) => ctx.db.query("deliveries").collect()),
    ).toHaveLength(2);
    await expect(
      t.mutation(api.kyc.saveDraft, {
        token,
        answers: a,
        language: "es",
        step: 6,
        revision: 1,
      }),
    ).rejects.toThrow("READ_ONLY");
    expect(await t.query(api.kyc.get, { token })).toMatchObject({
      status: "enviado",
      language: "en",
      folio: first,
    });
  });
  it("preserves receipts when email fails and restricts retries", async () => {
    const t = backend(),
      s = await seed(t);
    const id = await t.run((ctx) =>
      ctx.db.insert("deliveries", {
        submissionId: s.id,
        kind: "buyer",
        status: "pending",
        attempts: 0,
        updatedAt: Date.now(),
        generation: 0,
      }),
    );
    expect(await t.mutation(internal.kyc.claimMail, { id })).toBe(true);
    expect(await t.mutation(internal.kyc.claimMail, { id })).toBe(false);
    await t.mutation(internal.kyc.completeMail, {
      id,
      sent: false,
      transient: false,
      error: "EMAIL_NOT_CONFIGURED",
    });
    expect(await t.run((ctx) => ctx.db.get(id))).toMatchObject({
      status: "failed",
    });
    await expect(t.mutation(api.kyc.retryEmail, { id })).rejects.toThrow(
      "UNAUTHORIZED",
    );
    await t
      .withIdentity({ subject: s.createdBy })
      .mutation(api.kyc.retryEmail, { id });
    expect(await t.run((ctx) => ctx.db.get(id))).toMatchObject({
      status: "pending",
      generation: 1,
      attempts: 0,
    });
  });
});
