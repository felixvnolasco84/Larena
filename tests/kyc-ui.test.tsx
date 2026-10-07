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
  it("keeps entries when switching languages and saves the selected language", async () => {
    const ops = operations();
    render(<Wizard data={data} operations={ops} />);
    fireEvent.change(
      screen.getByLabelText(
        "Número de identificación fiscal de su país (Tax ID / SSN / ITIN) *",
      ),
      { target: { value: "SYNTHETIC-TAX-ID" } },
    );
    fireEvent.change(screen.getByLabelText("Idioma / Language"), {
      target: { value: "en" },
    });
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
