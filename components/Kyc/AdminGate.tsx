"use client";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth(),
    { signOut } = useAuthActions();
  const staff = useQuery(api.kyc.staff, isAuthenticated ? {} : "skip");
  if (isLoading || (isAuthenticated && staff === undefined))
    return <p role="status">Verificando acceso…</p>;
  if (!isAuthenticated || !staff)
    return (
      <div className="kyc-notice">
        <h1>Acceso privado</h1>
        <p>Este panel está disponible para los correos autorizados por OGC.</p>
        <Link className="kyc-link" href="/admin/login">
          Iniciar sesión
        </Link>
        {isAuthenticated && (
          <button className="kyc-link" onClick={() => void signOut()}>
            Cerrar sesión
          </button>
        )}
      </div>
    );
  return (
    <>
      <div className="kyc-toolbar" style={{ marginBottom: 24 }}>
        <Link href="/admin/kyc" className="kyc-link">
          Expedientes KYC
        </Link>
        <button className="kyc-link" onClick={() => void signOut()}>
          Cerrar sesión
        </button>
      </div>
      {children}
    </>
  );
}
