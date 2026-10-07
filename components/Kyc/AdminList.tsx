"use client";
import { usePaginatedQuery } from "convex/react";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { PROJECTS } from "@/lib/kyc/model";
import InvitationForm from "./InvitationForm";
import KycSelect from "./Select";
export default function AdminList() {
  const [create, setCreate] = useState(false),
    [status, setStatus] = useState(""),
    [project, setProject] = useState(""),
    [search, setSearch] = useState("");
  const list = usePaginatedQuery(
    api.kyc.list,
    {
      ...(status ? { status: status as "borrador" | "enviado" } : {}),
      ...(project ? { project } : {}),
      ...(search ? { search } : {}),
    },
    { initialNumItems: 20 },
  );
  return (
    <>
      <div className="kyc-toolbar">
        <h1>Expedientes KYC</h1>
        <button className="kyc-button" onClick={() => setCreate(true)}>
          Nueva invitación
        </button>
      </div>
      {create && <InvitationForm onClose={() => setCreate(false)} />}
      <div className="kyc-panel" style={{ marginTop: 24 }}>
        <div className="kyc-filter">
          <div>
            <label className="kyc-label" htmlFor="filter-status">Estado</label>
            <KycSelect
              id="filter-status"
              value={status}
              onValueChange={setStatus}
              options={[
                { value: "", label: "Todos" },
                { value: "borrador", label: "Borrador" },
                { value: "enviado", label: "Enviado" },
              ]}
            />
          </div>
          <div>
            <label className="kyc-label" htmlFor="filter-project">Proyecto</label>
            <KycSelect
              id="filter-project"
              value={project}
              onValueChange={setProject}
              options={[
                { value: "", label: "Todos" },
                ...PROJECTS.map((p) => ({ value: p, label: p })),
              ]}
            />
          </div>
          <div>
            <label className="kyc-label" htmlFor="filter-search">Buscar por folio o unidad</label>
            <input
              id="filter-search"
              className="kyc-input"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="kyc-table-wrap">
          <table className="kyc-table">
            <thead>
              <tr>
                <th>Folio / Unidad</th>
                <th>Comprador</th>
                <th>Estado</th>
                <th>Enlace</th>
                <th>Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {list.results.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/admin/kyc/${s.id}`}>
                      {s.folio || s.invitation.unidad}
                    </Link>
                    <div>
                      {s.invitation.proyecto} · {s.invitation.unidad}
                    </div>
                  </td>
                  <td>{s.name}</td>
                  <td>{s.status === "enviado" ? "Enviado" : "Borrador"}</td>
                  <td>
                    {s.invitation.revoked
                      ? "Revocado"
                      : s.invitation.expiresAt <= Date.now()
                        ? "Vencido"
                        : "Vigente"}
                  </td>
                  <td>{new Date(s.updatedAt).toLocaleDateString("es-MX")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!list.results.length && (
          <p role="status">
            {list.status === "LoadingFirstPage"
              ? "Cargando…"
              : list.status === "Exhausted"
                ? "No hay expedientes que coincidan."
                : "Sin coincidencias en los expedientes cargados. Puedes cargar más."}
          </p>
        )}
        <div className="kyc-actions">
          {list.status !== "Exhausted" && (
            <button
              className="kyc-button secondary"
              disabled={list.status !== "CanLoadMore"}
              onClick={() => list.loadMore(20)}
            >
              {list.status === "LoadingMore" ? "Cargando…" : "Cargar más"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
