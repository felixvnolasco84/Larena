"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Wizard from "./Wizard";
import { downloadFile } from "@/lib/kyc/download";
import { text } from "@/lib/kyc/model";
export default function KycClient({ token }: { token: string }) {
  const data = useQuery(api.kyc.get, { token }),
    save = useMutation(api.kyc.saveDraft),
    generate = useMutation(api.kyc.generateUpload),
    register = useMutation(api.kyc.registerUpload),
    cancel = useMutation(api.kyc.cancelUpload),
    remove = useMutation(api.kyc.removeFile),
    submit = useMutation(api.kyc.submit);
  if (!data) return <p role="status">Cargando / Loading…</p>;
  if (data.status === "error")
    return (
      <div className="kyc-notice">
        <h1>Enlace no disponible / Link unavailable</h1>
        <p>
          {data.code === "EXPIRED_LINK"
            ? "El enlace ha vencido. / This link has expired."
            : data.code === "REVOKED_LINK"
              ? "El enlace fue revocado. / This link was revoked."
              : "El enlace es inválido o el servicio no está disponible. / This link is invalid or the service is unavailable."}
        </p>
        <p>Contacta a tu asesor de OGC. / Contact your OGC representative.</p>
      </div>
    );
  if (data.status === "enviado")
    return (
      <div className="kyc-notice" lang={data.language}>
        <h1>{data.language === "es" ? "Gracias" : "Thank you"}</h1>
        <p>{text("T9", data.language).replace("{kyc_id}", data.folio || "")}</p>
      </div>
    );
  return (
    <Wizard
      data={data}
      operations={{
        save: (answers, language, step, revision) =>
          save({ token, answers, language, step, revision }),
        remove: async (id) => {
          await remove({ token, id: id as Id<"files"> });
        },
        download: (id) => downloadFile(id, token),
        submit: (confirmations) => submit({ token, confirmations }),
        upload: async (field, file) => {
          const contentType = file.type || "image/heic";
          const grant = await generate({
            token,
            field,
            name: file.name,
            size: file.size,
            contentType,
          });
          try {
            const response = await fetch(grant.url, {
              method: "POST",
              headers: { "Content-Type": contentType },
              body: file,
            });
            if (!response.ok) throw new Error("UPLOAD_FAILED");
            const result = await response.json();
            await register({
              token,
              grantId: grant.grantId,
              storageId: result.storageId,
            });
          } catch (error) {
            await cancel({ token, grantId: grant.grantId }).catch(() => {});
            throw error;
          }
        },
      }}
    />
  );
}
