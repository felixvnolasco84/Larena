import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  action,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { PRIVACY_PATH, PRIVACY_VERSION } from "../lib/kyc/privacy";
import { answers, buyer } from "./schema";
import {
  fail,
  hashToken,
  requireInvitation,
  requireStaff,
  privacyUrl,
  randomToken,
} from "./access";
import {
  fields,
  kind,
  visible,
  sanitize,
  validate,
  validateFile,
  fileRule,
  VERSION,
  PROJECTS,
  displayAnswer,
} from "../lib/kyc/model";

export const staff = query({
  args: {},
  handler: async (ctx) => {
    try {
      await requireStaff(ctx);
      return true;
    } catch {
      return false;
    }
  },
});
const inviteArgs = {
  ...buyer,
  proyecto: v.string(),
  unidad: v.string(),
  asesor: v.string(),
  prefilled: answers,
};
export const createInvitation = action({
  args: inviteArgs,
  handler: async (
    ctx,
    args,
  ): Promise<{ token: string; id: Id<"submissions"> }> => {
    const token = randomToken();
    const id = await ctx.runMutation(internal.kyc.insertInvitation, {
      ...args,
      tokenHash: await hashToken(token),
    });
    return { token, id };
  },
});
export const insertInvitation = internalMutation({
  args: { ...inviteArgs, tokenHash: v.string() },
  handler: async (ctx, args) => {
    const createdBy = await requireStaff(ctx);
    privacyUrl();
    if (
      !PROJECTS.includes(args.proyecto) ||
      !args.unidad.trim() ||
      args.unidad.length > 100 ||
      args.asesor.length > 150
    )
      fail("INVALID_INVITATION");
    const { prefilled: initial, ...metadata } = args;
    const invitationId = await ctx.db.insert("invitations", {
      ...metadata,
      unidad: args.unidad.trim(),
      expiresAt: Date.now() + 30 * 86400000,
      revoked: false,
      createdBy,
    });
    const allowed =
      args.tipo_persona === "Persona física"
        ? ["pf_nombre", "pf_email", "pf_telefono"]
        : ["pm_razon", "pm_email", "pm_telefono"];
    const prefilled = Object.fromEntries(
      Object.entries(initial).filter(([key]) => allowed.includes(key)),
    );
    return await ctx.db.insert("submissions", {
      invitationId,
      proyecto: args.proyecto,
      searchText: args.unidad.trim(),
      status: "borrador",
      answers: prefilled,
      language: "es",
      step: 0,
      revision: 0,
      updatedAt: Date.now(),
      version: VERSION,
    });
  },
});
export const regenerate = action({
  args: { id: v.id("submissions") },
  handler: async (ctx, { id }): Promise<string> => {
    const token = randomToken();
    await ctx.runMutation(internal.kyc.rotate, {
      id,
      hash: await hashToken(token),
    });
    return token;
  },
});
export const rotate = internalMutation({
  args: { id: v.id("submissions"), hash: v.string() },
  handler: async (ctx, { id, hash }) => {
    await requireStaff(ctx);
    const s = await ctx.db.get(id);
    if (!s || s.status !== "borrador") fail("READ_ONLY");
    await ctx.db.patch(s.invitationId, {
      tokenHash: hash,
      revoked: false,
      expiresAt: Date.now() + 30 * 86400000,
    });
  },
});
export const revoke = mutation({
  args: { id: v.id("submissions") },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const s = await ctx.db.get(id);
    if (!s) fail("NOT_FOUND");
    await ctx.db.patch(s.invitationId, { revoked: true });
  },
});
export const get = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    try {
      const { invite, submission } = await requireInvitation(ctx, token);
      if (submission.status === "enviado")
        return {
          status: "enviado" as const,
          folio: submission.folio,
          language: submission.language,
        };
      const files = await ctx.db
        .query("files")
        .withIndex("by_submission", (q) => q.eq("submissionId", submission._id))
        .collect();
      return {
        status: "borrador" as const,
        invitation: {
          proyecto: invite.proyecto,
          unidad: invite.unidad,
          asesor: invite.asesor,
          tipo_persona: invite.tipo_persona,
          origen_comprador: invite.origen_comprador,
        },
        submission,
        files: files.map(({ storageId, ...f }) => f),
        privacyUrl: privacyUrl(),
      };
    } catch (error) {
      return {
        status: "error" as const,
        code: error instanceof ConvexError ? String(error.data) : "UNAVAILABLE",
      };
    }
  },
});
export const saveDraft = mutation({
  args: {
    token: v.string(),
    answers,
    language: v.union(v.literal("es"), v.literal("en")),
    step: v.number(),
    revision: v.number(),
  },
  handler: async (ctx, args) => {
    const { invite, submission } = await requireInvitation(ctx, args.token);
    if (submission.status !== "borrador") fail("READ_ONLY");
    if (args.revision !== submission.revision) fail("DRAFT_CONFLICT");
    if (
      !Number.isInteger(args.step) ||
      args.step < 0 ||
      args.step > 6 ||
      JSON.stringify(args.answers).length > 60000
    )
      fail("INVALID_DRAFT");
    const clean = sanitize(invite, args.answers);
    await ctx.db.patch(submission._id, {
      answers: clean,
      step: args.step,
      language: args.language,
      revision: submission.revision + 1,
      updatedAt: Date.now(),
    });
    return submission.revision + 1;
  },
});
export const generateUpload = mutation({
  args: {
    token: v.string(),
    field: v.string(),
    name: v.string(),
    size: v.number(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const { invite, submission } = await requireInvitation(ctx, args.token);
    if (submission.status !== "borrador") fail("READ_ONLY");
    const f = fields.find((f) => f.id === args.field);
    if (
      !f ||
      !visible(f, invite, submission.answers) ||
      !validateFile(args.field, args) ||
      args.name.length > 255
    )
      fail("INVALID_FILE");
    const files = await ctx.db
      .query("files")
      .withIndex("by_submission", (q) => q.eq("submissionId", submission._id))
      .collect();
    const grants = await ctx.db
      .query("uploadGrants")
      .withIndex("by_submission", (q) => q.eq("submissionId", submission._id))
      .collect();
    if (
      files.filter((f) => f.field === args.field).length +
        grants.filter(
          (g) =>
            g.field === args.field && !g.consumed && g.expiresAt > Date.now(),
        ).length >=
      fileRule(args.field).count
    )
      fail("FILE_LIMIT");
    const grantId = await ctx.db.insert("uploadGrants", {
      submissionId: submission._id,
      field: args.field,
      name: args.name,
      size: args.size,
      contentType: args.contentType,
      expiresAt: Date.now() + 3600000,
      consumed: false,
    });
    return { grantId, url: await ctx.storage.generateUploadUrl() };
  },
});
export const registerUpload = mutation({
  args: {
    token: v.string(),
    grantId: v.id("uploadGrants"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const { invite, submission } = await requireInvitation(ctx, args.token);
    if (submission.status !== "borrador") fail("READ_ONLY");
    const grant = await ctx.db.get(args.grantId);
    if (
      !grant ||
      grant.submissionId !== submission._id ||
      grant.consumed ||
      grant.expiresAt <= Date.now()
    )
      fail("INVALID_UPLOAD");
    const f = fields.find((f) => f.id === grant.field)!;
    if (!visible(f, invite, submission.answers)) fail("INVALID_UPLOAD");
    const existing = await ctx.db
      .query("files")
      .withIndex("by_storage", (q) => q.eq("storageId", args.storageId))
      .first();
    const meta = await ctx.db.system.get(args.storageId);
    if (
      existing ||
      !meta ||
      meta._creationTime < grant._creationTime ||
      meta.size !== grant.size ||
      meta.contentType !== grant.contentType ||
      !validateFile(grant.field, {
        ...grant,
        contentType: meta.contentType || "",
      })
    )
      fail("INVALID_UPLOAD");
    const files = await ctx.db
      .query("files")
      .withIndex("by_submission", (q) => q.eq("submissionId", submission._id))
      .collect();
    if (
      files.filter((f) => f.field === grant.field).length >=
      fileRule(grant.field).count
    )
      fail("FILE_LIMIT");
    await ctx.db.patch(grant._id, { consumed: true });
    return await ctx.db.insert("files", {
      submissionId: submission._id,
      storageId: args.storageId,
      field: grant.field,
      name: grant.name,
      size: meta.size,
      contentType: meta.contentType!,
    });
  },
});
export const cancelUpload = mutation({
  args: { token: v.string(), grantId: v.id("uploadGrants") },
  handler: async (ctx, args) => {
    const { submission } = await requireInvitation(ctx, args.token);
    if (submission.status !== "borrador") fail("READ_ONLY");
    const grant = await ctx.db.get(args.grantId);
    if (!grant || grant.submissionId !== submission._id) fail("UNAUTHORIZED");
    await ctx.db.patch(grant._id, { consumed: true });
  },
});
export const removeFile = mutation({
  args: { token: v.string(), id: v.id("files") },
  handler: async (ctx, { token, id }) => {
    const { submission } = await requireInvitation(ctx, token);
    if (submission.status !== "borrador") fail("READ_ONLY");
    const f = await ctx.db.get(id);
    if (!f || f.submissionId !== submission._id) fail("UNAUTHORIZED");
    await ctx.storage.delete(f.storageId);
    await ctx.db.delete(id);
  },
});
export const submit = mutation({
  args: { token: v.string(), confirmations: v.record(v.string(), v.string()) },
  handler: async (ctx, { token, confirmations }) => {
    const { invite, submission } = await requireInvitation(ctx, token);
    if (submission.status === "enviado") return submission.folio!;
    const notice = privacyUrl();
    const files = await ctx.db
      .query("files")
      .withIndex("by_submission", (q) => q.eq("submissionId", submission._id))
      .collect();
    const applicable = files.filter((x) => {
      const f = fields.find((f) => f.id === x.field);
      return f && visible(f, invite, submission.answers);
    });
    const errors = validate(
      invite,
      submission.answers,
      applicable,
      submission.language,
    );
    const emailKey =
      invite.tipo_persona === "Persona física" ? "pf_email" : "pm_email";
    if (confirmations[emailKey] !== submission.answers[emailKey])
      errors[emailKey] =
        submission.language === "es"
          ? "Confirma tu correo electrónico."
          : "Confirm your email address.";
    if (Object.keys(errors).length)
      throw new ConvexError({ code: "VALIDATION", fields: errors });
    for (const f of applicable) {
      const meta = await ctx.db.system.get(f.storageId);
      if (
        !meta ||
        !validateFile(f.field, {
          ...f,
          size: meta.size,
          contentType: meta.contentType || "",
        })
      )
        fail("INVALID_FILE");
    }
    const counter = await ctx.db
      .query("counters")
      .withIndex("by_key", (q) => q.eq("key", "KYC-LAR"))
      .unique();
    const next = (counter?.value || 0) + 1;
    if (counter) await ctx.db.patch(counter._id, { value: next });
    else await ctx.db.insert("counters", { key: "KYC-LAR", value: next });
    const folio = `KYC-LAR-${String(next).padStart(4, "0")}`;
    await ctx.db.patch(submission._id, {
      status: "enviado",
      answers: sanitize(invite, submission.answers),
      folio,
      kyc_id: folio,
      searchText: `${invite.unidad} ${folio}`,
      submittedAt: Date.now(),
      firma_fecha: new Date(Date.now()).toISOString(),
      privacyVersion:
        new URL(notice).pathname === PRIVACY_PATH ? PRIVACY_VERSION : undefined,
      privacyUrl: notice,
      updatedAt: Date.now(),
    });
    // Remove superseded attachments from the final record without purging storage.
    for (const f of files.filter(
      (x) => !applicable.some((y) => y._id === x._id),
    ))
      await ctx.db.delete(f._id);
    for (const kind of ["buyer", "internal"] as const) {
      const deliveryId = await ctx.db.insert("deliveries", {
        submissionId: submission._id,
        kind,
        status: "pending",
        attempts: 0,
        generation: 0,
        updatedAt: Date.now(),
      });
      await ctx.scheduler.runAfter(0, internal.mail.send, { deliveryId });
    }
    return folio;
  },
});
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(v.literal("borrador"), v.literal("enviado"))),
    project: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const needle = (args.search || "").trim().slice(0, 100);
    const q = ctx.db.query("submissions");
    const result = needle
      ? await q
          .withSearchIndex("search_unit_folio", (q) => {
            let match = q.search("searchText", needle);
            if (args.project) match = match.eq("proyecto", args.project);
            if (args.status) match = match.eq("status", args.status);
            return match;
          })
          .paginate(args.paginationOpts)
      : await (
          args.project
            ? q.withIndex("by_project_status", (q) =>
                args.status
                  ? q.eq("proyecto", args.project!).eq("status", args.status)
                  : q.eq("proyecto", args.project!),
              )
            : args.status
              ? q.withIndex("by_status", (q) => q.eq("status", args.status!))
              : q
        )
          .order("desc")
          .paginate(args.paginationOpts);
    const rows = await Promise.all(
      result.page.map(async (s) => ({
        ...s,
        invitation: (await ctx.db.get(s.invitationId))!,
      })),
    );
    return {
      ...result,
      page: rows.map((s) => ({
        id: s._id,
        status: s.status,
        folio: s.folio,
        updatedAt: s.updatedAt,
        invitation: s.invitation,
        name: displayAnswer(
          s.answers[
            s.invitation.tipo_persona === "Persona física"
              ? "pf_nombre"
              : "pm_razon"
          ],
          "es",
          "",
        ),
      })),
    };
  },
});
export const detail = query({
  args: { id: v.id("submissions") },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const s = await ctx.db.get(id);
    if (!s) fail("NOT_FOUND");
    return {
      submission: s,
      invitation: (await ctx.db.get(s.invitationId))!,
      files: (
        await ctx.db
          .query("files")
          .withIndex("by_submission", (q) => q.eq("submissionId", id))
          .collect()
      ).map(({ storageId, ...f }) => f),
      deliveries: await ctx.db
        .query("deliveries")
        .withIndex("by_submission", (q) => q.eq("submissionId", id))
        .collect(),
    };
  },
});
export const fileSource = query({
  args: {
    id: v.id("files"),
    token: v.optional(v.string()),
    proxyKey: v.string(),
  },
  handler: async (ctx, { id, token, proxyKey }) => {
    if (
      !process.env.KYC_FILE_PROXY_SECRET ||
      proxyKey !== process.env.KYC_FILE_PROXY_SECRET
    )
      fail("UNAUTHORIZED");
    const file = await ctx.db.get(id);
    if (!file) fail("NOT_FOUND");
    if (token) {
      const { submission } = await requireInvitation(ctx, token);
      if (
        submission._id !== file.submissionId ||
        submission.status !== "borrador"
      )
        fail("UNAUTHORIZED");
    } else await requireStaff(ctx);
    return {
      url: await ctx.storage.getUrl(file.storageId),
      name: file.name,
      contentType: file.contentType,
    };
  },
});
export const retryEmail = mutation({
  args: { id: v.id("deliveries") },
  handler: async (ctx, { id }) => {
    await requireStaff(ctx);
    const d = await ctx.db.get(id);
    if (!d || d.status !== "failed") fail("INVALID_DELIVERY");
    await ctx.db.patch(id, {
      status: "pending",
      attempts: 0,
      generation: d.generation + 1,
      error: undefined,
      updatedAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.mail.send, { deliveryId: id });
  },
});
export const mailData = internalQuery({
  args: { id: v.id("deliveries") },
  handler: async (ctx, { id }) => {
    const delivery = await ctx.db.get(id);
    if (!delivery) fail("NOT_FOUND");
    const submission = (await ctx.db.get(delivery.submissionId))!;
    return {
      delivery,
      submission,
      invitation: (await ctx.db.get(submission.invitationId))!,
    };
  },
});
export const claimMail = internalMutation({
  args: { id: v.id("deliveries") },
  handler: async (ctx, { id }) => {
    const d = await ctx.db.get(id);
    if (
      !d ||
      (d.status !== "pending" &&
        !(d.status === "sending" && Date.now() - d.updatedAt > 300000))
    )
      return false;
    await ctx.db.patch(id, {
      status: "sending",
      attempts: d.attempts + 1,
      updatedAt: Date.now(),
    });
    // A recovery job also handles an action that terminates after claiming the delivery.
    await ctx.scheduler.runAfter(310000, internal.mail.send, {
      deliveryId: id,
    });
    return true;
  },
});
export const completeMail = internalMutation({
  args: {
    id: v.id("deliveries"),
    sent: v.boolean(),
    providerId: v.optional(v.string()),
    error: v.optional(v.string()),
    transient: v.boolean(),
  },
  handler: async (ctx, args) => {
    const d = await ctx.db.get(args.id);
    if (!d || d.status !== "sending") return;
    const retry = !args.sent && args.transient && d.attempts < 3;
    await ctx.db.patch(d._id, {
      status: args.sent ? "sent" : retry ? "pending" : "failed",
      providerId: args.providerId,
      error: args.error,
      updatedAt: Date.now(),
    });
    if (retry)
      await ctx.scheduler.runAfter(d.attempts * 60000, internal.mail.send, {
        deliveryId: d._id,
      });
  },
});
