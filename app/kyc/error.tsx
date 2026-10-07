"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="kyc-notice">
      <h1>Servicio no disponible / Service unavailable</h1>
      <p>
        Intenta de nuevo o contacta a tu asesor de OGC. / Try again or contact
        your OGC representative.
      </p>
      <button className="kyc-button" onClick={reset}>
        Reintentar / Retry
      </button>
    </div>
  );
}
