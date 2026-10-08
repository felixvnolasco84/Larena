// @vitest-environment jsdom
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import {
  render,
  fireEvent,
  screen,
  cleanup,
  act,
} from "@testing-library/react";
import Signature from "../components/Kyc/Signature";
import Wizard, {
  type WizardData,
  type WizardOperations,
} from "../components/Kyc/Wizard";
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});
function choose(label: string, option: string) {
  fireEvent.keyDown(screen.getByRole("combobox", { name: label }), { key: "Enter" });
  fireEvent.click(screen.getByRole("option", { name: option }));
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
const data: WizardData = {
  invitation: {
    tipo_persona: "Persona física",
    origen_comprador: "Extranjera",
    proyecto: "Larena",
    unidad: "TEST",
    asesor: "QA",
  },
  submission: {
    answers: { pf_nombre: { first: "Test", last: "Buyer", second: "" } },
    language: "es",
    step: 1,
    revision: 0,
  },
  files: [],
  privacyUrl: "https://example.test/kyc-privacy",
};
function operations(save = vi.fn().mockResolvedValue(1)): WizardOperations {
  return {
    save,
    upload: vi.fn(),
    remove: vi.fn(),
    download: vi.fn(),
    submit: vi.fn(),
  };
}
describe("Draft interaction", () => {
  beforeEach(() => vi.useFakeTimers());
  it.each([
    ["Persona física", "pf_telefono", 1],
    ["Persona moral", "pm_telefono", 1],
    ["Persona física", "bc_telefono", 2],
  ] as const)("saves the selected phone code for %s / %s", async (buyer, field, step) => {
    const ops = operations();
    render(<Wizard data={{ ...data,
      invitation: { ...data.invitation, tipo_persona: buyer },
      submission: { ...data.submission, step, answers: { bc_existe: "Sí" } },
    }} operations={ops} />);
    const phone = document.getElementById(field) as HTMLInputElement;
    expect(screen.getByRole("combobox", { name: "País de la clave telefónica" }).textContent).toBe("MX +52");
    fireEvent.change(phone, { target: { value: "5545009532" } });
    await act(async () => { await vi.advanceTimersByTimeAsync(900); });
    expect(ops.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ [field]: "+52 5545009532" }), "es", step, 0,
    );
    choose("País de la clave telefónica", "España (+34)");
    expect(phone.value).toBe("5545009532");
    choose("Idioma / Language", "EN");
    expect(screen.getByRole("combobox", { name: "Phone country code" }).textContent).toBe("ES +34");
    await act(async () => { await vi.advanceTimersByTimeAsync(900); });
    expect(ops.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ [field]: "+34 5545009532" }), "en", step, 1,
    );
  });
  it("restores a saved international phone and accepts pasted codes without duplicating them", async () => {
    const ops = operations(vi.fn().mockImplementation(async (_answers, _language, _step, revision) => revision + 1));
    render(<Wizard data={{ ...data, submission: { ...data.submission,
      answers: { ...data.submission.answers, pf_telefono: "+44 20 7946 0018" },
    } }} operations={ops} />);
    const phone = screen.getByLabelText("Teléfono (con clave de país) *") as HTMLInputElement;
    expect(phone.value).toBe("20 7946 0018");
    expect(screen.getByRole("combobox", { name: "País de la clave telefónica" }).textContent).toBe("GB +44");
    expect(ops.save).not.toHaveBeenCalled();
    fireEvent.change(phone, { target: { value: "20 " } });
    expect(phone.value).toBe("20 ");
    fireEvent.change(phone, { target: { value: "+52 5545009532" } });
    expect(phone.value).toBe("5545009532");
    await act(async () => { await vi.advanceTimersByTimeAsync(900); });
    expect(ops.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ pf_telefono: "+52 5545009532" }), "es", 1, 0,
    );
    fireEvent.change(phone, { target: { value: "" } });
    choose("País de la clave telefónica", "Canadá (+1)");
    await act(async () => { await vi.advanceTimersByTimeAsync(900); });
    expect(ops.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ pf_telefono: "" }), "es", 1, 1,
    );
    fireEvent.change(phone, { target: { value: "416 555 0123" } });
    await act(async () => { await vi.advanceTimersByTimeAsync(900); });
    expect(ops.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ pf_telefono: "+1 416 555 0123" }), "es", 1, 2,
    );
    expect(screen.getByRole("combobox", { name: "País de la clave telefónica" }).textContent).toBe("CA +1");
  });
  it("keeps the country selector and local number linked to validation errors", async () => {
    render(<Wizard data={data} operations={operations()} />);
    fireEvent.change(screen.getByLabelText("Teléfono (con clave de país) *"), { target: { value: "12" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Continuar →" })); });
    for (const element of [screen.getByLabelText("Teléfono (con clave de país) *"), screen.getByRole("combobox", { name: "País de la clave telefónica" })]) {
      expect(element.getAttribute("aria-invalid")).toBe("true");
      expect(element.getAttribute("aria-describedby")).toContain("pf_telefono-error");
    }
    expect(document.getElementById("pf_telefono-error")?.textContent).toContain("teléfono válido");
  });
  it("keeps entries when switching languages and saves the selected language", async () => {
    const ops = operations();
    render(<Wizard data={data} operations={ops} />);
    fireEvent.change(
      screen.getByLabelText(
        "Número de identificación fiscal de su país (Tax ID / SSN / ITIN) *",
      ),
      { target: { value: "SYNTHETIC-TAX-ID" } },
    );
    choose("Idioma / Language", "EN");
    expect(
      (
        screen.getByLabelText(
          "Tax ID number in your country of tax residence (SSN / ITIN / SIN) *",
        ) as HTMLInputElement
      ).value,
    ).toBe("SYNTHETIC-TAX-ID");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
    expect(ops.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ pf_taxid: "SYNTHETIC-TAX-ID" }),
      "en",
      1,
      0,
    );
    expect(screen.getByRole("status").textContent).toBe("Saved");
  });
  it("translates the selected country without changing the saved ISO code", async () => {
    const ops = operations();
    render(<Wizard data={data} operations={ops} />);
    choose("País de residencia fiscal *", "Alemania");
    choose("Idioma / Language", "EN");
    expect(screen.getByRole("combobox", { name: "Country of tax residence *" }).textContent).toBe("Germany");
    await act(async () => { await vi.advanceTimersByTimeAsync(900); });
    expect(ops.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ pf_pais_fiscal: "DE" }), "en", 1, 0,
    );
  });
  it("preserves unsaved entries on network failure and permits retry", async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network failure"))
      .mockResolvedValue(1);
    render(<Wizard data={data} operations={operations(save)} />);
    const field = screen.getByLabelText(
      "Número de identificación fiscal de su país (Tax ID / SSN / ITIN) *",
    ) as HTMLInputElement;
    fireEvent.change(field, { target: { value: "SYNTHETIC-TAX-ID" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
    expect(field.value).toBe("SYNTHETIC-TAX-ID");
    expect(screen.getByRole("status").textContent).toBe("No se pudo guardar");
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Reintentar guardado" }),
      );
    });
    expect(save).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status").textContent).toBe("Guardado");
  });
  it("blocks overwriting a draft changed on another device", async () => {
    const save = vi.fn().mockRejectedValue(new Error("DRAFT_CONFLICT"));
    render(<Wizard data={data} operations={operations(save)} />);
    const field = screen.getByLabelText(
      "Número de identificación fiscal de su país (Tax ID / SSN / ITIN) *",
    );
    fireEvent.change(field, { target: { value: "SYNTHETIC-TAX-ID" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
    fireEvent.change(field, { target: { value: "SYNTHETIC-TAX-ID-2" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(900);
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Recargar versión guardada" }),
    ).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Continuar →" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
describe("Document upload feedback", () => {
  const documentData: WizardData = {
    ...data,
    invitation: { ...data.invitation, origen_comprador: "Mexicana" },
    submission: { ...data.submission, answers: {}, step: 5 },
  };
  const savedFile = { _id: "saved-csf", field: "doc_csf", name: "constancia.pdf", size: 1024, contentType: "application/pdf" };

  it("shows the selected filename while uploading and completes only after storage confirms it", async () => {
    let finishUpload!: () => void;
    const ops = operations();
    ops.upload = vi.fn(() => new Promise<void>((resolve) => { finishUpload = resolve; }));
    const { rerender } = render(<Wizard data={documentData} operations={ops} />);
    expect(screen.getByText("0 de 3 documentos obligatorios adjuntados")).toBeTruthy();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Constancia de situación fiscal/), {
        target: { files: [new File([new Uint8Array(1024)], "constancia.pdf", { type: "application/pdf" })] },
      });
    });
    expect(screen.getByText("constancia.pdf")).toBeTruthy();
    expect(screen.getAllByText("Subiendo archivo…").length).toBeGreaterThan(0);
    expect(screen.queryByText("Completo")).toBeNull();
    expect((screen.getByRole("button", { name: "Procesando…" }) as HTMLButtonElement).disabled).toBe(true);
    await act(async () => { finishUpload(); });
    expect(screen.queryByText("Completo")).toBeNull();
    expect(screen.getAllByText("Confirmando archivo…").length).toBeGreaterThan(0);
    rerender(<Wizard data={{ ...documentData, files: [savedFile] }} operations={ops} />);
    expect(screen.getByText("Completo")).toBeTruthy();
    expect(screen.getByText("constancia.pdf")).toBeTruthy();
    expect(screen.getByText(/Archivo guardado/)).toBeTruthy();
    expect(screen.getByText("1 de 3 documentos obligatorios adjuntados")).toBeTruthy();
  });

  it("keeps a failed upload incomplete and offers a retry", async () => {
    const ops = operations();
    ops.upload = vi.fn().mockRejectedValue(new Error("UPLOAD_FAILED"));
    render(<Wizard data={documentData} operations={ops} />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Constancia de situación fiscal/), {
        target: { files: [new File(["test PDF"], "constancia.pdf", { type: "application/pdf" })] },
      });
    });
    expect(screen.getByText("No se pudo subir el archivo. Selecciónalo de nuevo para reintentar.")).toBeTruthy();
    expect(screen.queryByText("Completo")).toBeNull();
    expect(screen.getByText("0 de 3 documentos obligatorios adjuntados")).toBeTruthy();
    expect((screen.getByLabelText(/Constancia de situación fiscal/) as HTMLInputElement).disabled).toBe(false);
  });

  it("counts the same persisted requirements as validation and returns a removed document to pending", async () => {
    const files = [savedFile, { ...savedFile, _id: "saved-id", field: "doc_id", name: "identificacion.pdf" }, { ...savedFile, _id: "saved-address", field: "doc_domicilio", name: "domicilio.pdf" }];
    const ops = operations();
    ops.remove = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(<Wizard data={{ ...documentData, files }} operations={ops} />);
    expect(screen.getByText("3 de 3 documentos obligatorios adjuntados")).toBeTruthy();
    expect(screen.getAllByText("Completo")).toHaveLength(3);
    await act(async () => { fireEvent.click(screen.getAllByRole("button", { name: "Quitar" })[1]); });
    expect(ops.remove).toHaveBeenCalledWith("saved-csf");
    rerender(<Wizard data={{ ...documentData, files: files.filter((file) => file.field !== "doc_csf") }} operations={ops} />);
    expect(screen.getByText("2 de 3 documentos obligatorios adjuntados")).toBeTruthy();
    expect(screen.getAllByText("Completo")).toHaveLength(2);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Continuar →" })); });
    expect(screen.getByRole("heading", { name: "Documentos" })).toBeTruthy();
    expect(screen.getByText("Este campo es obligatorio.")).toBeTruthy();
    rerender(<Wizard data={{ ...documentData, files }} operations={ops} />);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Continuar →" })); });
    expect(screen.getByRole("heading", { name: "Declaraciones y firma" })).toBeTruthy();
  });

  it("translates completion and does not upload an invalid file", async () => {
    const ops = operations();
    render(<Wizard data={{ ...documentData, submission: { ...documentData.submission, language: "en" }, files: [savedFile] }} operations={ops} />);
    expect(screen.getByText("Complete")).toBeTruthy();
    expect(screen.getByText("1 of 3 required documents attached")).toBeTruthy();
    expect(screen.getByText(/File saved/)).toBeTruthy();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Proof of address/), {
        target: { files: [new File(["bad file"], "document.exe", { type: "application/octet-stream" })] },
      });
    });
    expect(ops.upload).not.toHaveBeenCalled();
    expect(screen.getByText("Check the file format and size.")).toBeTruthy();
    expect(screen.getAllByText("Complete")).toHaveLength(1);
  });
});

describe("Drawn signature", () => {
  function canvasMocks() {
    class Pointer extends MouseEvent {
      pointerId = 1;
      pointerType: string;
      constructor(type: string, init: PointerEventInit) {
        super(type, init);
        this.pointerType = init.pointerType || "mouse";
      }
    }
    vi.stubGlobal("PointerEvent", Pointer);
    const stroke = vi.fn(),
      clearRect = vi.fn(),
      moveTo = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      beginPath: vi.fn(),
      moveTo,
      lineTo: vi.fn(),
      stroke,
      clearRect,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(
      HTMLCanvasElement.prototype,
      "getBoundingClientRect",
    ).mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 450,
      bottom: 180,
      width: 450,
      height: 180,
      toJSON: () => ({}),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, "setPointerCapture", {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
      (callback) =>
        callback(new Blob(["synthetic signature"], { type: "image/png" })),
    );
    return { stroke, clearRect, moveTo };
  }
  it("preserves the drawn proportions in the PNG at a narrow mobile width", () => {
    const { moveTo } = canvasMocks();
    vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 300, bottom: 180,
      width: 300, height: 180, toJSON: () => ({}),
    });
    render(<Signature language="en" disabled={false} onSave={vi.fn()} />);
    const canvas = screen.getByLabelText(
      "Draw your signature. You can also upload an image below.",
    ) as HTMLCanvasElement;
    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerMove(canvas, { clientX: 80, clientY: 70 });
    expect(canvas.width / canvas.height).toBeCloseTo(300 / 180);
    expect(moveTo).toHaveBeenCalledWith(60, 60);
  });
  it.each(["mouse", "touch"])(
    "accepts %s strokes, exports a PNG and clears only after success",
    async (pointerType) => {
      const { stroke, clearRect } = canvasMocks(),
        save = vi.fn().mockResolvedValue(true);
      render(<Signature language="en" disabled={false} onSave={save} />);
      const canvas = screen.getByLabelText(
        "Draw your signature. You can also upload an image below.",
      );
      fireEvent.pointerDown(canvas, { pointerType, clientX: 20, clientY: 20 });
      fireEvent.pointerMove(canvas, { pointerType, clientX: 80, clientY: 70 });
      fireEvent.pointerUp(canvas, { pointerType });
      expect(stroke).toHaveBeenCalled();
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Save signature" }));
      });
      expect(save.mock.calls[0][0]).toMatchObject({
        name: "firma.png",
        type: "image/png",
      });
      expect(clearRect).toHaveBeenCalled();
      expect(
        (
          screen.getByRole("button", {
            name: "Save signature",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
    },
  );
  it("keeps drawn ink after a failed upload and can clear manually", async () => {
    const { clearRect } = canvasMocks(),
      save = vi.fn().mockResolvedValue(false);
    render(<Signature language="en" disabled={false} onSave={save} />);
    const canvas = screen.getByLabelText(
      "Draw your signature. You can also upload an image below.",
    );
    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerMove(canvas, { clientX: 80, clientY: 70 });
    fireEvent.pointerUp(canvas);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save signature" }));
    });
    expect(clearRect).not.toHaveBeenCalled();
    expect(
      (
        screen.getByRole("button", {
          name: "Save signature",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(clearRect).toHaveBeenCalled();
  });
});
