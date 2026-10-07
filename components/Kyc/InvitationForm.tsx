"use client";
import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { PROJECTS, type Answers, type BuyerContext } from "@/lib/kyc/model";
import KycSelect from "./Select";
export default function InvitationForm({ onClose }: { onClose: () => void }) {
  const create = useAction(api.kyc.createInvitation);
  const [busy, setBusy] = useState(false),
    [link, setLink] = useState(""),
    [error, setError] = useState(""),
    [copied, setCopied] = useState(false),
    [project, setProject] = useState("Larena"),
    [origin, setOrigin] = useState("Mexicana"),
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
            <div>
              <label className="kyc-label" htmlFor="invite-project">Proyecto</label>
              <KycSelect
                id="invite-project"
                name="project"
                value={project}
                onValueChange={setProject}
                disabled={busy}
                options={PROJECTS.map((p) => ({ value: p, label: p }))}
              />
            </div>
            <div>
              <label className="kyc-label" htmlFor="invite-unit">Unidad *</label>
              <input
                id="invite-unit"
                className="kyc-input"
                name="unit"
                required
                maxLength={100}
                placeholder="C-302"
              />
            </div>
            <div>
              <label className="kyc-label" htmlFor="invite-advisor">Asesor o broker</label>
              <input id="invite-advisor" className="kyc-input" name="advisor" maxLength={150} />
            </div>
            <div>
              <label className="kyc-label" htmlFor="invite-buyer">Tipo de comprador</label>
              <KycSelect
                id="invite-buyer"
                value={buyer}
                onValueChange={(value) =>
                  setBuyer(value as BuyerContext["tipo_persona"])
                }
                disabled={busy}
                options={["Persona física", "Persona moral"].map((value) => ({ value, label: value }))}
              />
            </div>
            <div>
              <label className="kyc-label" htmlFor="invite-origin">Origen del comprador</label>
              <KycSelect
                id="invite-origin"
                name="origin"
                value={origin}
                onValueChange={setOrigin}
                disabled={busy}
                options={["Mexicana", "Extranjera"].map((value) => ({ value, label: value }))}
              />
            </div>
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
              <div>
                <label className="kyc-label" htmlFor="invite-name">Razón social</label>
                <input id="invite-name" className="kyc-input" name="name" maxLength={500} />
              </div>
            )}
            <div>
              <label className="kyc-label" htmlFor="invite-email">Correo del comprador</label>
              <input
                id="invite-email"
                className="kyc-input"
                name="email"
                type="email"
                maxLength={500}
              />
            </div>
            <div>
              <label className="kyc-label" htmlFor="invite-phone">Teléfono del comprador</label>
              <input
                id="invite-phone"
                className="kyc-input"
                name="phone"
                type="tel"
                placeholder="+52…"
                maxLength={30}
              />
            </div>
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
