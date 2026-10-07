"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const { signIn } = useAuthActions(),
    router = useRouter();
  const [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="kyc-panel kyc-login">
      <div className="kyc-eyebrow">OGC · ACCESO PRIVADO</div>
      <h1>Panel KYC</h1>
      <p>
        {sent
          ? "Ingresa el código de ocho dígitos que recibiste. Expira en 15 minutos."
          : "Ingresa tu correo autorizado para recibir un código de acceso."}
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await signIn(
              "resend-otp",
              sent
                ? { email: email.trim().toLowerCase(), code }
                : { email: email.trim().toLowerCase() },
            );
            if (sent) router.push("/admin/kyc");
            else setSent(true);
          } catch {
            setError(
              "No fue posible iniciar sesión. Revisa tu correo, código y autorización de acceso.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="kyc-label" htmlFor="staff-email">
          Correo electrónico
        </label>
        <input
          className="kyc-input"
          id="staff-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          disabled={busy || sent}
          onChange={(e) => setEmail(e.target.value)}
        />
        {sent && (
          <>
            <label
              className="kyc-label"
              style={{ marginTop: 20 }}
              htmlFor="staff-code"
            >
              Código de acceso
            </label>
            <input
              className="kyc-input"
              id="staff-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{8}"
              maxLength={8}
              required
              value={code}
              disabled={busy}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </>
        )}
        {error && (
          <p className="kyc-error" role="alert">
            {error}
          </p>
        )}
        <button className="kyc-button" disabled={busy} type="submit">
          {busy ? "Procesando…" : sent ? "Entrar" : "Enviar código"}
        </button>
        {sent && (
          <button
            className="kyc-link"
            type="button"
            disabled={busy}
            onClick={() => {
              setSent(false);
              setCode("");
            }}
          >
            Solicitar otro código
          </button>
        )}
      </form>
    </div>
  );
}
