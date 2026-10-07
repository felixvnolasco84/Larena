"use client";
import { useState, type ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";

export default function KycProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() =>
    process.env.NEXT_PUBLIC_CONVEX_URL
      ? new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL, {
          logger: false,
        })
      : null,
  );
  if (!client)
    return (
      <div className="kyc-notice" role="status">
        <h1>Formulario no disponible</h1>
        <p>
          El servicio KYC está pendiente de configuración. Contacta a tu asesor
          de OGC.
        </p>
        <p>
          The KYC service is awaiting setup. Please contact your OGC
          representative.
        </p>
      </div>
    );
  return (
    <ConvexAuthNextjsProvider client={client}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
