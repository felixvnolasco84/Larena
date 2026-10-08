// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import KycSelect from "../components/Kyc/Select";
import InvitationForm from "../components/Kyc/InvitationForm";

const createInvitation = vi.hoisted(() => vi.fn());
vi.mock("convex/react", () => ({ useAction: () => createInvitation }));
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  createInvitation.mockReset().mockResolvedValue({ token: "a".repeat(64) });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function choose(label: string, option: string) {
  fireEvent.keyDown(screen.getByRole("combobox", { name: label }), { key: "Enter" });
  fireEvent.click(screen.getByRole("option", { name: option }));
}

describe("Shadcn Select integration", () => {
  it("restores an empty filter and keeps its accessible label", () => {
    const changed = vi.fn();
    function Filter() {
      const [value, setValue] = useState("");
      return <><label htmlFor="status">Estado</label><KycSelect id="status" value={value}
        options={[{ value: "", label: "Todos" }, { value: "enviado", label: "Enviado" }]}
        onValueChange={value => { changed(value); setValue(value); }} /></>;
    }
    render(<Filter />);
    choose("Estado", "Enviado");
    expect(changed).toHaveBeenLastCalledWith("enviado");
    choose("Estado", "Todos");
    expect(changed).toHaveBeenLastCalledWith("");
    expect(screen.getByRole("combobox", { name: "Estado" }).textContent).toBe("Todos");
  });

  it("preserves invitation project, origin and buyer classification in FormData", async () => {
    render(<InvitationForm onClose={vi.fn()} />);
    choose("Proyecto", "Las Arenas");
    choose("Origen del comprador", "Extranjera");
    choose("Tipo de comprador", "Persona moral");
    fireEvent.change(screen.getByLabelText("Unidad *"), { target: { value: "SELECT-TEST" } });
    fireEvent.change(screen.getByLabelText("Razón social"), { target: { value: "Empresa de prueba" } });
    choose("País de la clave telefónica", "Estados Unidos (+1)");
    fireEvent.change(screen.getByLabelText("Teléfono del comprador"), { target: { value: "213 373 4253" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear enlace privado" }));
    await waitFor(() => expect(createInvitation).toHaveBeenCalledWith(expect.objectContaining({
      proyecto: "Las Arenas", origen_comprador: "Extranjera", tipo_persona: "Persona moral",
      unidad: "SELECT-TEST", prefilled: expect.objectContaining({ pm_razon: "Empresa de prueba", pm_telefono: "+1 213 373 4253" }),
    })));
  });
});
