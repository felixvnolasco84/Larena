"use client";
import { useRef, useState } from "react";
import { t, type Language } from "@/lib/kyc/model";
export default function Signature({
  language,
  disabled,
  onSave,
}: {
  language: Language;
  disabled: boolean;
  onSave: (file: File) => Promise<boolean>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);
  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * e.currentTarget.width) / rect.width,
      y: ((e.clientY - rect.top) * e.currentTarget.height) / rect.height,
    };
  }
  function clear() {
    const element = canvas.current;
    element?.getContext("2d")?.clearRect(0, 0, element.width, element.height);
    setHasInk(false);
  }
  return (
    <div>
      <canvas
        ref={canvas}
        width={900}
        height={360}
        className="kyc-signature"
        aria-label={t(
          language,
          "Área para dibujar tu firma. También puedes cargar una imagen debajo.",
          "Draw your signature. You can also upload an image below.",
        )}
        onPointerDown={(e) => {
          if (disabled) return;
          if (!hasInk) {
            const rect = e.currentTarget.getBoundingClientRect();
            if (rect.width > 0)
              e.currentTarget.height = Math.round(
                (e.currentTarget.width * rect.height) / rect.width,
              );
          }
          e.currentTarget.setPointerCapture(e.pointerId);
          last.current = point(e);
        }}
        onPointerMove={(e) => {
          if (!last.current || disabled) return;
          const p = point(e),
            ctx = canvas.current!.getContext("2d")!;
          ctx.beginPath();
          ctx.moveTo(last.current.x, last.current.y);
          ctx.lineTo(p.x, p.y);
          ctx.lineWidth =
            (2 * canvas.current!.width) /
            canvas.current!.getBoundingClientRect().width;
          ctx.lineCap = "round";
          ctx.strokeStyle = "#333";
          ctx.stroke();
          last.current = p;
          setHasInk(true);
        }}
        onPointerUp={() => {
          last.current = null;
        }}
        onPointerCancel={() => {
          last.current = null;
        }}
      />
      <div className="kyc-toolbar">
        <button
          type="button"
          className="kyc-link"
          onClick={clear}
          disabled={disabled}
        >
          {t(language, "Limpiar", "Clear")}
        </button>
        <button
          type="button"
          className="kyc-button secondary"
          disabled={!hasInk || disabled}
          onClick={() =>
            canvas.current?.toBlob((blob) => {
              if (blob)
                void onSave(
                  new File([blob], "firma.png", { type: "image/png" }),
                )
                  .then((saved) => {
                    if (saved) clear();
                  })
                  .catch(() => {});
            }, "image/png")
          }
        >
          {t(language, "Guardar firma", "Save signature")}
        </button>
      </div>
    </div>
  );
}
