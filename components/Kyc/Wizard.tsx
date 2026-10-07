"use client";
import { useEffect, useRef, useState } from "react";
import {
  fields,
  kind,
  stepOf,
  visible,
  options,
  countries,
  fileRule,
  validateFile,
  validate,
  displayAnswer,
  text,
  t,
  steps,
  type Answers,
  type Answer,
  type BuyerContext,
  type FileInfo,
  type Language,
  type Name,
} from "@/lib/kyc/model";
import Signature from "./Signature";

export type WizardData = {
  invitation: BuyerContext & {
    proyecto: string;
    unidad: string;
    asesor: string;
  };
  submission: {
    answers: Answers;
    language: Language;
    step: number;
    revision: number;
  };
  files: FileInfo[];
  privacyUrl: string;
};
export type WizardOperations = {
  save: (
    answers: Answers,
    language: Language,
    step: number,
    revision: number,
  ) => Promise<number>;
  upload: (field: string, file: File) => Promise<void>;
  remove: (id: string) => Promise<void>;
  download: (id: string) => Promise<void>;
  submit: (confirmations: Record<string, string>) => Promise<string>;
};
export default function Wizard({
  data,
  operations,
}: {
  data: WizardData;
  operations: WizardOperations;
}) {
  const [answers, setAnswers] = useState<Answers>(data.submission.answers),
    [language, setLanguage] = useState<Language>(data.submission.language),
    [step, setStep] = useState(data.submission.step);
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [saveState, setSaveState] = useState("saved"),
    [busy, setBusy] = useState(false),
    [review, setReview] = useState(false),
    [folio, setFolio] = useState<string | null>(null),
    [message, setMessage] = useState("");
  const revision = useRef(data.submission.revision),
    latest = useRef({ answers, language, step }),
    dirty = useRef(false),
    chain = useRef<Promise<void>>(Promise.resolve()),
    heading = useRef<HTMLHeadingElement>(null);
  latest.current = { answers, language, step };
  const confirmation = useRef<Record<string, string>>({});
  const [confirmEmail, setConfirmEmail] = useState<Record<string, string>>({});
  const conflict = useRef(false);
  const active = fields.filter(
    (f) => stepOf(f) === step && visible(f, data.invitation, answers),
  );
  function update(id: string, value: Answer) {
    setAnswers((a) => ({ ...a, [id]: value }));
    dirty.current = true;
    setErrors((e) => ({ ...e, [id]: "" }));
    setReview(false);
  }
  async function flush() {
    const run = async () => {
      if (conflict.current) throw new Error("DRAFT_CONFLICT");
      if (!dirty.current) return;
      const snapshot = latest.current;
      dirty.current = false;
      setSaveState("saving");
      try {
        revision.current = await operations.save(
          snapshot.answers,
          snapshot.language,
          snapshot.step,
          revision.current,
        );
        setSaveState("saved");
      } catch (error) {
        dirty.current = true;
        setSaveState("error");
        if (String(error).includes("DRAFT_CONFLICT")) conflict.current = true;
        throw error;
      }
    };
    const work = chain.current.then(run);
    chain.current = work.catch(() => {});
    return work;
  }
  useEffect(() => {
    if (!dirty.current || conflict.current) return;
    const timer = setTimeout(() => {
      void flush().catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
    // Each edit schedules a serialized save; backend revisions prevent overwriting another device.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, language, step]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  function checks(which?: number) {
    const result = validate(
      data.invitation,
      answers,
      data.files,
      language,
      which,
    );
    for (const f of fields.filter(
      (f) =>
        kind(f) === "email" &&
        visible(f, data.invitation, answers) &&
        (which === undefined || stepOf(f) === which),
    ))
      if (confirmation.current[f.id] !== answers[f.id])
        result[f.id] = t(
          language,
          "Confirma tu correo electrónico.",
          "Confirm your email address.",
        );
    setErrors(result);
    return result;
  }
  function failure(error: unknown) {
    if (String(error).includes("DRAFT_CONFLICT"))
      setMessage(
        t(
          language,
          "El expediente cambió en otro dispositivo. Recarga la página para continuar con la versión guardada.",
          "This draft changed on another device. Reload to continue with the saved version.",
        ),
      );
    else
      setMessage(
        t(
          language,
          "No pudimos completar la acción. Tus datos siguen en pantalla; inténtalo de nuevo.",
          "We could not complete this action. Your entries remain on screen; please try again.",
        ),
      );
  }
  async function navigate(next: number) {
    if (next > step && Object.keys(checks(step)).length) return;
    setBusy(true);
    setMessage("");
    try {
      await flush();
      setStep(next);
      dirty.current = true;
      setReview(false);
      heading.current?.focus();
    } catch (error) {
      failure(error);
    } finally {
      setBusy(false);
    }
  }
  async function upload(field: string, file: File) {
    const mime =
      file.type ||
      (file.name.toLowerCase().endsWith(".heic") ? "image/heic" : "");
    if (
      !validateFile(field, {
        name: file.name,
        size: file.size,
        contentType: mime,
      })
    ) {
      setErrors((e) => ({
        ...e,
        [field]: t(
          language,
          "Revisa el formato y tamaño del archivo.",
          "Check the file format and size.",
        ),
      }));
      return false;
    }
    setBusy(true);
    setMessage("");
    try {
      await flush();
      await operations.upload(field, file);
      setErrors((e) => ({ ...e, [field]: "" }));
      return true;
    } catch (error) {
      failure(error);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function finish() {
    const result = checks();
    if (Object.keys(result).length) {
      const f = fields.find((f) => result[f.id]);
      if (f) setStep(stepOf(f));
      setReview(false);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await flush();
      if (!review) {
        setReview(true);
        heading.current?.focus();
      } else setFolio(await operations.submit(confirmation.current));
    } catch (error) {
      failure(error);
    } finally {
      setBusy(false);
    }
  }
  if (folio)
    return (
      <div className="kyc-notice" lang={language}>
        <h1>{t(language, "Gracias", "Thank you")}</h1>
        <p>{text("T9", language).replace("{kyc_id}", folio)}</p>
      </div>
    );
  const labels: Record<string, string> = {
    intro: "T1",
    bc_intro: "T2",
    or_aviso_efectivo: "T3",
    pep_intro: "T4",
    doc_intro: "T5",
    aviso_privacidad: "T6",
    acepta_validacion: "T7",
    declaracion: "T8",
  };
  const copyFor = (id: string) =>
    labels[id] ? text(labels[id] as Parameters<typeof text>[0], language) : "";
  const saveLabel =
    saveState === "saving"
      ? t(language, "Guardando…", "Saving…")
      : saveState === "error"
        ? t(language, "No se pudo guardar", "Could not save")
        : t(language, "Guardado", "Saved");
  return (
    <section
      lang={language}
      aria-label={t(language, "Formulario KYC", "KYC form")}
    >
      <div className="kyc-toolbar">
        <div className="kyc-eyebrow">
          {data.invitation.proyecto} · {data.invitation.unidad}
        </div>
        <label className="kyc-language">
          {t(language, "Idioma", "Language")}
          <select
            value={language}
            disabled={busy}
            onChange={(e) => {
              setLanguage(e.target.value as Language);
              dirty.current = true;
              setErrors({});
            }}
            aria-label="Idioma / Language"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </label>
      </div>
      <h1>{t(language, "Conozca a su Cliente", "Know Your Client")}</h1>
      <p className="kyc-progress-label">
        {t(language, "Paso", "Step")} {step + 1} {t(language, "de", "of")} {steps.length}
      </p>
      <ol
        className="kyc-steps"
        aria-label={t(language, "Progreso", "Progress")}
      >
        {steps.map((labels, i) => (
          <li
            key={i}
            className={i <= step ? "active" : ""}
            aria-current={i === step ? "step" : undefined}
            aria-label={`${i + 1}. ${labels[language === "es" ? 0 : 1]}`}
          >
            <span className="kyc-step-number" aria-hidden="true">{i + 1}</span>
            <span className="kyc-step-label" aria-hidden="true">{labels[language === "es" ? 0 : 1]}</span>
          </li>
        ))}
      </ol>
      <div className="kyc-panel">
        <div className="kyc-toolbar kyc-panel-heading">
          <h2 ref={heading} tabIndex={-1}>
            {review
              ? t(language, "Revisa tu información", "Review your information")
              : steps[step][language === "es" ? 0 : 1]}
          </h2>
          <span className="kyc-status" role="status">
            {saveLabel}
          </span>
        </div>
        {message && (
          <p className="kyc-error" role="alert">
            {message}
          </p>
        )}
        {saveState === "error" && (
          <div className="kyc-alert">
            <p>
              {t(
                language,
                "El último cambio no se ha guardado. Reintenta antes de salir.",
                "Your latest change has not been saved. Retry before leaving.",
              )}
            </p>
            <button
              type="button"
              className="kyc-link"
              onClick={() => void flush().catch(failure)}
            >
              {t(language, "Reintentar guardado", "Retry saving")}
            </button>
            {conflict.current && (
              <button
                type="button"
                className="kyc-link"
                onClick={() => window.location.reload()}
              >
                {t(
                  language,
                  "Recargar versión guardada",
                  "Reload saved version",
                )}
              </button>
            )}
          </div>
        )}
        {review ? (
          <div className="kyc-review">
            <dl>
              {fields
                .filter(
                  (f) =>
                    visible(f, data.invitation, answers) &&
                    !["paragraph", "heading"].includes(kind(f)),
                )
                .map((f) => (
                  <div key={f.id} style={{ display: "contents" }}>
                    <dt>
                      {f[language].startsWith("(")
                        ? copyFor(f.id)
                        : f[language]}
                    </dt>
                    <dd>
                      {["file", "signature"].includes(kind(f))
                        ? data.files
                            .filter((x) => x.field === f.id)
                            .map((x) => x.name)
                            .join(", ") ||
                          t(language, "No adjuntado", "Not attached")
                        : displayAnswer(answers[f.id], language, f.id)}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 6) void navigate(step + 1);
              else void finish();
            }}
          >
            <fieldset disabled={busy} className="kyc-grid">
              {step === 0 && (
                <div className="kyc-field wide kyc-intro">
                  <p>{text("T1", language)}</p>
                  <p>
                    <a
                      className="kyc-link"
                      href={data.privacyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t(
                        language,
                        "Consulta el aviso de privacidad KYC antes de completar tus datos.",
                        "Read the KYC Privacy Notice before entering your information.",
                      )}
                    </a>
                  </p>
                  <p className="kyc-helper">
                    {t(
                      language,
                      "Puedes guardar tu avance y volver mediante este mismo enlace durante 30 días. Prepara los documentos que correspondan a tu caso.",
                      "You can save your progress and return using this link within 30 days. Please prepare the documents that apply to your case.",
                    )}
                  </p>
                </div>
              )}
              {active
                .filter((f) => !["titulo", "intro"].includes(f.id))
                .map((f) => {
                  const k = kind(f),
                    value = answers[f.id],
                    error = errors[f.id],
                    label = copyFor(f.id) || f[language];
                  if (k === "paragraph")
                    return (
                      <div key={f.id} className="kyc-field wide">
                        <p>
                          {f.id === "doc_intro"
                            ? t(
                                language,
                                "Sube copias legibles y vigentes. Cada campo indica sus formatos y límite de tamaño.",
                                "Upload clear, current copies. Each field shows its accepted formats and size limit.",
                              )
                            : f.id === "aviso_privacidad"
                              ? label.replace(
                                  /\[.*?\]/g,
                                  t(
                                    language,
                                    "el enlace siguiente",
                                    "the following link",
                                  ),
                                )
                              : label}{" "}
                          {f.id === "aviso_privacidad" && (
                            <a
                              href={data.privacyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="kyc-link"
                            >
                              {t(
                                language,
                                "Consultar aviso completo",
                                "Read the full Privacy Notice",
                              )}
                            </a>
                          )}
                        </p>
                      </div>
                    );
                  return (
                    <div
                      key={f.id}
                      className={`kyc-field ${["multi", "radio", "check", "signature", "name", "textarea"].includes(k) ? "wide" : ""}`}
                    >
                      {!["radio", "multi", "check"].includes(k) && (
                        <label
                          id={`${f.id}-label`}
                          htmlFor={f.id}
                          className="kyc-label"
                        >
                          {label}
                          {f.required
                            ? " *"
                            : ` (${t(language, "opcional", "optional")})`}
                        </label>
                      )}
                      {k === "name" ? (
                        <div className="kyc-name">
                          {(["first", "last", "second"] as const).map(
                            (part, i) => (
                              <label key={part}>
                                {t(
                                  language,
                                  [
                                    "Nombre(s)",
                                    "Apellido paterno",
                                    "Apellido materno (opcional)",
                                  ][i],
                                  [
                                    "Given names",
                                    "Last name",
                                    "Second last name (optional)",
                                  ][i],
                                )}
                                <input
                                  className="kyc-input"
                                  id={i === 0 ? f.id : undefined}
                                  autoComplete={
                                    i === 0
                                      ? "given-name"
                                      : i === 1
                                        ? "family-name"
                                        : "additional-name"
                                  }
                                  value={
                                    typeof value === "object" &&
                                    !Array.isArray(value)
                                      ? value[part]
                                      : ""
                                  }
                                  onChange={(e) =>
                                    update(f.id, {
                                      first: "",
                                      last: "",
                                      second: "",
                                      ...(typeof value === "object" &&
                                      !Array.isArray(value)
                                        ? value
                                        : {}),
                                      [part]: e.target.value,
                                    } as Name)
                                  }
                                  aria-invalid={!!error}
                                  aria-describedby={
                                    error ? `${f.id}-error` : undefined
                                  }
                                  maxLength={150}
                                />
                              </label>
                            ),
                          )}
                        </div>
                      ) : null}
                      {["text", "phone", "email"].includes(k) && (
                        <>
                          <input
                            id={f.id}
                            className="kyc-input"
                            type={
                              k === "email"
                                ? "email"
                                : k === "phone"
                                  ? "tel"
                                  : "text"
                            }
                            autoComplete={
                              k === "email"
                                ? "email"
                                : k === "phone"
                                  ? "tel"
                                  : "off"
                            }
                            value={typeof value === "string" ? value : ""}
                            placeholder={
                              k === "phone" ? "+52 624 123 4567" : undefined
                            }
                            onChange={(e) => update(f.id, e.target.value)}
                            aria-invalid={!!error}
                            aria-describedby={
                              error ? `${f.id}-error` : undefined
                            }
                            maxLength={500}
                          />
                          {k === "email" && (
                            <label
                              className="kyc-helper"
                              htmlFor={`${f.id}-confirmation`}
                            >
                              {t(
                                language,
                                "Confirmar correo electrónico",
                                "Confirm email address",
                              )}
                              <input
                                id={`${f.id}-confirmation`}
                                className="kyc-input"
                                type="email"
                                autoComplete="off"
                                value={confirmEmail[f.id] || ""}
                                onChange={(e) => {
                                  confirmation.current[f.id] = e.target.value;
                                  setConfirmEmail((a) => ({
                                    ...a,
                                    [f.id]: e.target.value,
                                  }));
                                }}
                                aria-invalid={!!error}
                                maxLength={500}
                              />
                            </label>
                          )}
                        </>
                      )}
                      {k === "textarea" && (
                        <textarea
                          id={f.id}
                          className="kyc-input"
                          value={typeof value === "string" ? value : ""}
                          onChange={(e) => update(f.id, e.target.value)}
                          aria-invalid={!!error}
                          aria-describedby={error ? `${f.id}-error` : undefined}
                          maxLength={5000}
                        />
                      )}
                      {k === "country" && (
                        <select
                          id={f.id}
                          className="kyc-input"
                          value={typeof value === "string" ? value : ""}
                          onChange={(e) => update(f.id, e.target.value)}
                          aria-invalid={!!error}
                          aria-describedby={error ? `${f.id}-error` : undefined}
                        >
                          <option value="">
                            {t(
                              language,
                              "Selecciona un país",
                              "Select a country",
                            )}
                          </option>
                          {countries(language).map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {["radio", "multi"].includes(k) && (
                        <fieldset
                          aria-describedby={error ? `${f.id}-error` : undefined}
                        >
                          <legend>{label} *</legend>
                          <div className="kyc-options">
                            {options(f.id, language).map((o) => (
                              <label key={o.value} className="kyc-choice">
                                <input
                                  type={k === "multi" ? "checkbox" : "radio"}
                                  name={f.id}
                                  checked={
                                    k === "multi"
                                      ? Array.isArray(value) &&
                                        value.includes(o.value)
                                      : value === o.value
                                  }
                                  onChange={(e) =>
                                    update(
                                      f.id,
                                      k === "multi"
                                        ? e.target.checked
                                          ? [
                                              ...(Array.isArray(value)
                                                ? value
                                                : []),
                                              o.value,
                                            ]
                                          : (Array.isArray(value)
                                              ? value
                                              : []
                                            ).filter((x) => x !== o.value)
                                        : o.value,
                                    )
                                  }
                                />
                                <span>{o.label}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      )}
                      {k === "check" && (
                        <label className="kyc-choice">
                          <input
                            id={f.id}
                            type="checkbox"
                            checked={value === true}
                            onChange={(e) => update(f.id, e.target.checked)}
                            aria-describedby={
                              error ? `${f.id}-error` : undefined
                            }
                          />
                          <span>{label} *</span>
                        </label>
                      )}
                      {["file", "signature"].includes(k) && (
                        <>
                          {k === "signature" &&
                            !data.files.some((x) => x.field === f.id) && (
                              <Signature
                                language={language}
                                disabled={busy}
                                onSave={(file) => upload(f.id, file)}
                              />
                            )}
                          <div className="kyc-upload">
                            <input
                              id={f.id}
                              className="kyc-upload-input"
                              type="file"
                              accept={fileRule(f.id).accept}
                              multiple={fileRule(f.id).count > 1}
                              disabled={
                                busy ||
                                data.files.filter((x) => x.field === f.id)
                                  .length >= fileRule(f.id).count
                              }
                              onChange={async (e) => {
                                const picked = Array.from(e.target.files || []);
                                e.target.value = "";
                                const remaining =
                                  fileRule(f.id).count -
                                  data.files.filter((x) => x.field === f.id)
                                    .length;
                                if (picked.length > remaining) {
                                  setErrors((x) => ({
                                    ...x,
                                    [f.id]: t(
                                      language,
                                      "Superaste el número de archivos permitido.",
                                      "Too many files selected.",
                                    ),
                                  }));
                                  return;
                                }
                                for (const file of picked)
                                  await upload(f.id, file);
                              }}
                              aria-describedby={`${f.id}-help${error ? ` ${f.id}-error` : ""}`}
                              aria-labelledby={`${f.id}-label`}
                              aria-invalid={!!error}
                            />
                            <label htmlFor={f.id} className="kyc-upload-trigger">
                              {data.files.filter((x) => x.field === f.id).length >= fileRule(f.id).count
                                ? t(language, "Archivos adjuntados", "Files attached")
                                : k === "signature"
                                  ? t(language, "Cargar imagen de firma", "Upload a signature image")
                                  : fileRule(f.id).count > 1
                                    ? t(language, "Seleccionar archivos", "Choose files")
                                    : t(language, "Seleccionar archivo", "Choose a file")}
                            </label>
                          </div>
                          <span className="kyc-helper" id={`${f.id}-help`}>
                            {fileRule(f.id).extensions.join(", ").toUpperCase()}{" "}
                            · {fileRule(f.id).maxBytes / 1024 ** 2} MB{" "}
                            {t(language, "por archivo", "per file")} ·{" "}
                            {t(language, "Máximo", "Maximum")}{" "}
                            {fileRule(f.id).count}
                          </span>
                          <ul className="kyc-files">
                            {data.files
                              .filter((x) => x.field === f.id)
                              .map((x) => (
                                <li key={x._id}>
                                  <span>
                                    {x.name} ({(x.size / 1024 ** 2).toFixed(1)}{" "}
                                    MB)
                                  </span>
                                  <button
                                    className="kyc-link"
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                      void operations
                                        .download(x._id)
                                        .catch(failure)
                                    }
                                  >
                                    {t(language, "Ver", "View")}
                                  </button>
                                  <button
                                    className="kyc-link"
                                    type="button"
                                    disabled={busy}
                                    onClick={async () => {
                                      setBusy(true);
                                      try {
                                        await operations.remove(x._id);
                                      } catch (error) {
                                        failure(error);
                                      } finally {
                                        setBusy(false);
                                      }
                                    }}
                                  >
                                    {t(language, "Quitar", "Remove")}
                                  </button>
                                </li>
                              ))}
                          </ul>
                        </>
                      )}
                      {error && (
                        <p
                          id={`${f.id}-error`}
                          className="kyc-error"
                          role="alert"
                        >
                          {error}
                        </p>
                      )}
                    </div>
                  );
                })}
            </fieldset>
            <button type="submit" hidden />
          </form>
        )}
        <div className="kyc-actions">
          <button
            type="button"
            className="kyc-button secondary"
            disabled={busy || step === 0}
            onClick={() =>
              review ? setReview(false) : void navigate(step - 1)
            }
          >
            {t(language, "Anterior", "Previous")}
          </button>
          <button
            type="button"
            className="kyc-link"
            disabled={busy}
            onClick={() => {
              dirty.current = true;
              void flush().catch(failure);
            }}
          >
            {t(
              language,
              "Guardar y continuar después",
              "Save and continue later",
            )}
          </button>
          <button
            type="button"
            className="kyc-button"
            disabled={busy || conflict.current}
            onClick={() => (step < 6 ? void navigate(step + 1) : void finish())}
          >
            {busy
              ? t(language, "Procesando…", "Processing…")
              : step < 6
                ? t(language, "Continuar →", "Continue →")
                : review
                  ? t(language, "Enviar formulario", "Submit form")
                  : t(language, "Revisar información", "Review information")}
          </button>
        </div>
      </div>
    </section>
  );
}
