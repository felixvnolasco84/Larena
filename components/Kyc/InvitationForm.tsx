"use client";
import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { PROJECTS, type Answers, type BuyerContext } from "@/lib/kyc/model";
export default function InvitationForm({ onClose }: { onClose: () => void }) {
  const create = useAction(api.kyc.createInvitation);
  const [busy, setBusy] = useState(false),
    [link, setLink] = useState(""),
    [error, setError] = useState(""),
    [copied, setCopied] = useState(false),
    [buyer, setBuyer] =
      useState<BuyerContext["tipo_persona"]>("Persona física");
  return (
    <div className="kyc-panel">
      <div className="kyc-toolbar">
        <h2>Nueva invitación</h2>
        <button className="kyc-link" onClick={onClose}>
          Cerrar
        </button>
      </div>
      {link ? (
        <>
          <p>
            Comparte este enlace privado con el comprador. Tiene una vigencia de
            30 días.
          </p>
          <div className="kyc-inline-code">{link}</div>
          <button
            className="kyc-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
              } catch {
                setError(
                  "No se pudo copiar. Selecciona y copia el enlace manualmente.",
                );
              }
            }}
          >
            {copied ? "Enlace copiado" : "Copiar enlace"}
          </button>
        </>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setBusy(true);
            setError("");
            try {
              const prefix = buyer === "Persona física" ? "pf" : "pm";
              const prefilled: Answers =
                buyer === "Persona física"
                  ? {
                      pf_nombre: {
                        first: String(form.get("first")),
                        last: String(form.get("last")),
                        second: String(form.get("second")),
                      },
                    }
                  : { pm_razon: String(form.get("name")) };
              prefilled[`${prefix}_email`] = String(form.get("email"));
              prefilled[`${prefix}_telefono`] = String(form.get("phone"));
              const result = await create({
                proyecto: String(form.get("project")),
                unidad: String(form.get("unit")),
                asesor: String(form.get("advisor")),
                tipo_persona: buyer,
                origen_comprador: form.get(
                  "origin",
                ) as BuyerContext["origen_comprador"],
                prefilled,
              });
              setLink(`${window.location.origin}/kyc/${result.token}`);
            } catch (e) {
              setError(
                String(e).includes("PRIVACY_NOT_CONFIGURED")
                  ? "Configura la URL del aviso KYC de OGC en Convex antes de crear invitaciones."
                  : "No se pudo crear la invitación. Verifica los datos y la configuración.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <fieldset disabled={busy} className="kyc-grid">
            <label className="kyc-label">
              Proyecto
              <select
                className="kyc-input"
                name="project"
                defaultValue="Larena"
              >
                {PROJECTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="kyc-label">
              Unidad *
              <input
                className="kyc-input"
                name="unit"
                required
                maxLength={100}
                placeholder="C-302"
              />
            </label>
            <label className="kyc-label">
              Asesor o broker
              <input className="kyc-input" name="advisor" maxLength={150} />
            </label>
            <label className="kyc-label">
              Tipo de comprador
              <select
                className="kyc-input"
                value={buyer}
                onChange={(e) =>
                  setBuyer(e.target.value as BuyerContext["tipo_persona"])
                }
              >
                <option>Persona física</option>
                <option>Persona moral</option>
              </select>
            </label>
            <label className="kyc-label">
              Origen del comprador
              <select className="kyc-input" name="origin">
                <option>Mexicana</option>
                <option>Extranjera</option>
              </select>
            </label>
            {buyer === "Persona física" ? (
              <div className="kyc-field wide kyc-name">
                <label>
                  Nombre(s)
                  <input className="kyc-input" name="first" maxLength={150} />
                </label>
                <label>
                  Apellido paterno
                  <input className="kyc-input" name="last" maxLength={150} />
                </label>
                <label>
                  Apellido materno
                  <input className="kyc-input" name="second" maxLength={150} />
                </label>
              </div>
            ) : (
              <label>
                Razón social
                <input className="kyc-input" name="name" maxLength={500} />
              </label>
            )}
            <label>
              Correo del comprador
              <input
                className="kyc-input"
                name="email"
                type="email"
                maxLength={500}
              />
            </label>
            <label>
              Teléfono del comprador
              <input
                className="kyc-input"
                name="phone"
                type="tel"
                placeholder="+52…"
                maxLength={30}
              />
            </label>
            <button type="submit" className="kyc-button">
              {busy ? "Creando…" : "Crear enlace privado"}
            </button>
          </fieldset>
        </form>
      )}
      {error && (
        <p className="kyc-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
