import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const answer = v.union(
  v.string(),
  v.boolean(),
  v.array(v.string()),
  v.object({ first: v.string(), last: v.string(), second: v.string() }),
);
export const answers = v.record(v.string(), answer);
export const buyer = {
  tipo_persona: v.union(
    v.literal("Persona física"),
    v.literal("Persona moral"),
  ),
  origen_comprador: v.union(v.literal("Mexicana"), v.literal("Extranjera")),
};
export default defineSchema({
  ...authTables,
  invitations: defineTable({
    ...buyer,
    proyecto: v.string(),
    unidad: v.string(),
    asesor: v.string(),
    tokenHash: v.string(),
    expiresAt: v.number(),
    revoked: v.boolean(),
    createdBy: v.id("users"),
  }).index("by_token", ["tokenHash"]),
  submissions: defineTable({
    invitationId: v.id("invitations"),
    proyecto: v.string(),
    searchText: v.string(),
    status: v.union(v.literal("borrador"), v.literal("enviado")),
    answers,
    language: v.union(v.literal("es"), v.literal("en")),
    step: v.number(),
    revision: v.number(),
    updatedAt: v.number(),
    folio: v.optional(v.string()),
    kyc_id: v.optional(v.string()),
    submittedAt: v.optional(v.number()),
    version: v.string(),
    privacyUrl: v.optional(v.string()),
    firma_fecha: v.optional(v.string()),
    privacyVersion: v.optional(v.string()),
  })
    .index("by_invitation", ["invitationId"])
    .index("by_status", ["status"])
    .index("by_project_status", ["proyecto", "status"])
    .index("by_folio", ["folio"])
    .searchIndex("search_unit_folio", {
      searchField: "searchText",
      filterFields: ["proyecto", "status"],
    }),
  files: defineTable({
    submissionId: v.id("submissions"),
    storageId: v.id("_storage"),
    field: v.string(),
    name: v.string(),
    size: v.number(),
    contentType: v.string(),
  })
    .index("by_submission", ["submissionId"])
    .index("by_storage", ["storageId"]),
  uploadGrants: defineTable({
    submissionId: v.id("submissions"),
    field: v.string(),
    name: v.string(),
    size: v.number(),
    contentType: v.string(),
    expiresAt: v.number(),
    consumed: v.boolean(),
  }).index("by_submission", ["submissionId"]),
  counters: defineTable({ key: v.string(), value: v.number() }).index(
    "by_key",
    ["key"],
  ),
  deliveries: defineTable({
    submissionId: v.id("submissions"),
    kind: v.union(v.literal("buyer"), v.literal("internal")),
    status: v.union(
      v.literal("pending"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    attempts: v.number(),
    updatedAt: v.number(),
    generation: v.number(),
    providerId: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_submission", ["submissionId"]),
});
