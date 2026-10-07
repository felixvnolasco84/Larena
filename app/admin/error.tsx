"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="kyc-notice">
      <h1>No se pudo abrir el panel</h1>
      <p>Revisa tu acceso o inténtalo de nuevo.</p>
      <button className="kyc-button" onClick={reset}>
        Reintentar
      </button>
    </div>
  );
}
