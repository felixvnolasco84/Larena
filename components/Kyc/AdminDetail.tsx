"use client";
import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  fields,
  visible,
  kind,
  displayAnswer,
  text,
  type Language,
} from "@/lib/kyc/model";
import { downloadFile } from "@/lib/kyc/download";
import KycSelect from "./Select";
export default function AdminDetail({ id }: { id: Id<"submissions"> }) {
  const data = useQuery(api.kyc.detail, { id }),
    regenerate = useAction(api.kyc.regenerate),
    revoke = useMutation(api.kyc.revoke),
    retry = useMutation(api.kyc.retryEmail);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [link, setLink] = useState(""),
    [language, setLanguage] = useState<Language>("es");
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch {
      setError("No se pudo completar la acción. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }
  if (!data) return <p role="status">Cargando expediente…</p>;
  const { submission: s, invitation: i } = data;
  return (
    <>
      <div className="kyc-toolbar">
        <h1>{s.folio || `Unidad ${i.unidad}`}</h1>
        <div className="kyc-language">
          <label htmlFor="detail-language">Idioma</label>
          <KycSelect
            id="detail-language"
            compact
            aria-label="Idioma de las respuestas"
            value={language}
            onValueChange={(value) => setLanguage(value as Language)}
            options={[{ value: "es", label: "ES" }, { value: "en", label: "EN" }]}
          />
        </div>
      </div>
      <div className="kyc-panel">
        <p>
          {i.proyecto} · {i.unidad} · {i.asesor || "Sin asesor"}
        </p>
        <p>
          {i.tipo_persona} · {i.origen_comprador} ·{" "}
          {s.status === "enviado" ? "Enviado" : "Borrador"}
        </p>
        <p>
          Enlace:{" "}
          {i.revoked
            ? "Revocado"
            : i.expiresAt <= Date.now()
              ? "Vencido"
              : "Vigente"}
          . Vence {new Date(i.expiresAt).toLocaleDateString("es-MX")}.
        </p>
        {s.status === "borrador" && (
          <div className="kyc-toolbar">
            <button
              className="kyc-button secondary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const token = await regenerate({ id });
                  setLink(`${window.location.origin}/kyc/${token}`);
                })
              }
            >
              Generar nuevo enlace
            </button>
            <button
              className="kyc-button secondary"
              disabled={busy || i.revoked}
              onClick={() =>
                void run(async () => {
                  await revoke({ id });
                  setLink("");
                })
              }
            >
              Revocar enlace
            </button>
          </div>
        )}
        {link && (
          <div className="kyc-inline-code">
            <p>{link}</p>
            <button
              className="kyc-link"
              onClick={() =>
                void run(() => navigator.clipboard.writeText(link))
              }
            >
              Copiar enlace
            </button>
          </div>
        )}
        {error && (
          <p className="kyc-error" role="alert">
            {error}
          </p>
        )}
        <div className="kyc-review">
          <dl>
            {fields
              .filter(
                (f) =>
                  visible(f, i, s.answers) &&
                  !["paragraph", "heading", "file", "signature"].includes(
                    kind(f),
                  ),
              )
              .map((f) => (
                <div key={f.id} style={{ display: "contents" }}>
                  <dt>
                    {f.id === "acepta_validacion"
                      ? text("T7", language)
                      : f.id === "declaracion"
                        ? text("T8", language)
                        : f[language]}
                  </dt>
                  <dd>{displayAnswer(s.answers[f.id], language, f.id)}</dd>
                </div>
              ))}
          </dl>
        </div>
        <h2 style={{ marginTop: 32 }}>Documentos y firma</h2>
        <ul className="kyc-files">
          {data.files.map((f) => (
            <li key={f._id}>
              <span>
                {fields.find((x) => x.id === f.field)?.[language]}
                <br />
                {f.name} · {(f.size / 1024 ** 2).toFixed(1)} MB
              </span>
              <button
                className="kyc-link"
                disabled={busy}
                onClick={() => void run(() => downloadFile(f._id))}
              >
                Descargar
              </button>
            </li>
          ))}
        </ul>
        {s.submittedAt && (
          <p className="kyc-helper">
            Fecha de firma: {new Date(s.submittedAt).toLocaleString("es-MX")} ·
            Versión: {s.version}
          </p>
        )}
        {s.privacyUrl && (
          <p className="kyc-helper">
            Aviso aceptado:{" "}
            <a href={s.privacyUrl} target="_blank" rel="noopener noreferrer">
              {s.privacyUrl}
            </a>
            {s.privacyVersion && <> · {s.privacyVersion}</>}
          </p>
        )}
        <h2 style={{ marginTop: 32 }}>Correos</h2>
        {!data.deliveries.length && (
          <p>Los avisos se enviarán al finalizar el formulario.</p>
        )}
        <ul className="kyc-files">
          {data.deliveries.map((d) => (
            <li key={d._id}>
              <span>
                {d.kind === "buyer"
                  ? "Confirmación al comprador"
                  : "Notificación interna"}{" "}
                ·{" "}
                {
                  {
                    pending: "Pendiente",
                    sending: "Enviando",
                    sent: "Enviado",
                    failed: "Falló",
                  }[d.status]
                }
                {d.error && ` · ${d.error}`}
              </span>
              {d.status === "failed" && (
                <button
                  className="kyc-link"
                  disabled={busy}
                  onClick={() => void run(() => retry({ id: d._id }))}
                >
                  Reintentar
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
