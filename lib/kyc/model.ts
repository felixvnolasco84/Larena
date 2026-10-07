import requirements from "./requirements.json";
import copy from "./copy.json";

export type Language = "es" | "en";
export type Name = { first: string; last: string; second: string };
export type Answer = string | boolean | string[] | Name;
export type Answers = Record<string, Answer>;
export type BuyerContext = {
  tipo_persona: "Persona física" | "Persona moral";
  origen_comprador: "Mexicana" | "Extranjera";
};
export type Field = (typeof requirements)[number];
export type FileInfo = {
  _id: string;
  field: string;
  name: string;
  size: number;
  contentType: string;
};
export const VERSION = "ogc-kyc-1";
export const PROJECTS = ["Larena", "Las Arenas", "LP-03", "Otro"];
export const fields = requirements.filter((f) => f.visibility === "Sí");
export const text = (key: keyof typeof copy, language: Language) =>
  copy[key][language];
export const t = (language: Language, es: string, en: string) =>
  language === "es" ? es : en;
export const steps = [
  ["Inicio", "Welcome"],
  ["Comprador", "Buyer"],
  ["Beneficiario controlador", "Beneficial owner"],
  ["Recursos y pago", "Funds and payment"],
  ["Declaración PEP", "PEP declaration"],
  ["Documentos", "Documents"],
  ["Declaraciones y firma", "Declarations and signature"],
];
export function stepOf(f: Field) {
  return Number(f.page.split(" ")[0].replace("B", "")) - 1;
}
export function kind(f: Field) {
  return (
    {
      Heading: "heading",
      Paragraph: "paragraph",
      "Short Text": "text",
      "Long Text": "textarea",
      "Full Name": "name",
      Phone: "phone",
      Email: "email",
      Dropdown: "country",
      "Single Choice": "radio",
      "Multiple Choice": "multi",
      "File Upload": "file",
      "Checkbox (1 opción)": "check",
      Signature: "signature",
    } as Record<string, string>
  )[f.type];
}
export function hasBeneficiary(a: Answers) {
  return a.bc_existe === "Sí" || a.bc_cuenta_propia === "No";
}
export function visible(f: Field, c: BuyerContext, a: Answers): boolean {
  const id = f.id;
  if (id.startsWith("pf_") && c.tipo_persona !== "Persona física") return false;
  if (id.startsWith("pm_") && c.tipo_persona !== "Persona moral") return false;
  if (["pf_taxid", "pf_pais_fiscal", "pm_taxid"].includes(id))
    return c.origen_comprador === "Extranjera";
  if (
    id.startsWith("bc_") &&
    !["bc_intro", "bc_cuenta_propia", "bc_existe"].includes(id)
  )
    return hasBeneficiary(a);
  if (id.startsWith("doc_bc_")) return hasBeneficiary(a);
  if (id === "or_aviso_efectivo")
    return Array.isArray(a.or_forma) && a.or_forma.includes("Efectivo");
  if (id === "or_titular_nombre") return a.or_titular === "No";
  if (["pep_dependencia", "pep_cargo", "pep_periodo"].includes(id))
    return a.pep === "Sí";
  if (id === "pep_fam_detalle") return a.pep_familiar === "Sí";
  if (["doc_id", "doc_domicilio", "doc_csf", "doc_taxid"].includes(id)) {
    return (
      c.tipo_persona === "Persona física" &&
      (id === "doc_csf"
        ? c.origen_comprador === "Mexicana"
        : id === "doc_taxid"
          ? c.origen_comprador === "Extranjera"
          : true)
    );
  }
  if (
    [
      "doc_acta",
      "doc_poder",
      "doc_id_rl",
      "doc_dom_pm",
      "doc_accionistas",
      "doc_csf_pm",
    ].includes(id)
  )
    return (
      c.tipo_persona === "Persona moral" &&
      (id !== "doc_csf_pm" || c.origen_comprador === "Mexicana")
    );
  return true;
}
const yn = [
  ["Sí", "Yes"],
  ["No", "No"],
];
const choices: Record<string, string[][]> = {
  bc_cuenta_propia: [
    ["Sí", "Sí, por cuenta propia", "Yes, on my own behalf"],
    [
      "No",
      "No, a nombre o en beneficio de un tercero",
      "No, on behalf of or for the benefit of a third party",
    ],
  ],
  bc_tipo: [
    ["Persona física", "Individual"],
    ["Persona moral", "Company"],
  ],
  pf_estado_civil: [
    ["Soltero(a)", "Single"],
    ["Casado(a)", "Married"],
    ["Unión libre", "Domestic partnership"],
    ["Divorciado(a)", "Divorced"],
    ["Viudo(a)", "Widowed"],
  ],
  or_origen: [
    ["Ahorros / ingresos por trabajo", "Savings / employment income"],
    ["Utilidades de negocio", "Business profits"],
    ["Venta de inmueble u otro activo", "Sale of property or other asset"],
    ["Inversiones", "Investments"],
    ["Herencia o donación", "Inheritance or gift"],
    ["Crédito o hipoteca", "Loan or mortgage"],
    ["Otro", "Other"],
  ],
  or_forma: [
    ["Transferencia nacional (SPEI)", "Domestic transfer"],
    ["Transferencia internacional", "International wire"],
    ["Cheque", "Check"],
    ["Crédito hipotecario", "Mortgage"],
    ["Efectivo", "Cash"],
  ],
};
export function options(id: string, language: Language) {
  return (choices[id] || yn).map((x) => ({
    value: x[0],
    label:
      x.length === 3
        ? x[language === "es" ? 1 : 2]
        : x[language === "es" ? 0 : 1],
  }));
}
export const countryCodes =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );
export function countries(language: Language) {
  const names = new Intl.DisplayNames([language], { type: "region" });
  return countryCodes
    .map((value) => ({ value, label: names.of(value) || value }))
    .sort((a, b) => a.label.localeCompare(b.label, language));
}
export function fileRule(id: string) {
  const f = fields.find((f) => f.id === id);
  if (id === "firma")
    return {
      maxBytes: 10 * 1024 ** 2,
      count: 1,
      extensions: ["png", "jpg", "jpeg"],
      accept: ".png,.jpg,.jpeg",
    };
  if (!f || kind(f) !== "file") throw new Error("INVALID_FILE_FIELD");
  const extensions = f.validation.split(" · ")[0].toLowerCase().split(", ");
  // JPEG is an equivalent extension of JPG, including mobile photo uploads.
  if (extensions.includes("jpg") && !extensions.includes("jpeg"))
    extensions.push("jpeg");
  return {
    maxBytes: (f.validation.includes("25 MB") ? 25 : 10) * 1024 ** 2,
    count: f.validation.includes("2 archivos")
      ? 2
      : f.validation.includes("3 archivos")
        ? 3
        : 1,
    extensions,
    accept: extensions.map((x) => "." + x).join(","),
  };
}
export function validateFile(
  field: string,
  file: { name: string; size: number; contentType: string },
) {
  const r = fileRule(field),
    ext = file.name.split(".").pop()?.toLowerCase() || "";
  const mime: Record<string, string[]> = {
    pdf: ["application/pdf"],
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
    heic: ["image/heic", "image/heif", "application/octet-stream"],
  };
  return (
    file.size > 0 &&
    file.size <= r.maxBytes &&
    r.extensions.includes(ext) &&
    mime[ext]?.includes(file.contentType)
  );
}
export function sanitize(c: BuyerContext, a: Answers): Answers {
  return Object.fromEntries(
    fields
      .filter(
        (f) =>
          visible(f, c, a) &&
          !["heading", "paragraph", "file", "signature"].includes(kind(f)),
      )
      .filter((f) => a[f.id] !== undefined)
      .map((f) => [f.id, a[f.id]]),
  );
}
export function validate(
  c: BuyerContext,
  a: Answers,
  files: FileInfo[],
  language: Language,
  step?: number,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields.filter(
    (f) => visible(f, c, a) && (step === undefined || stepOf(f) === step),
  )) {
    const k = kind(f),
      value = a[f.id],
      required = t(
        language,
        "Este campo es obligatorio.",
        "This field is required.",
      );
    if (["heading", "paragraph"].includes(k)) continue;
    if (k === "file" || k === "signature") {
      if (f.required && !files.some((x) => x.field === f.id))
        errors[f.id] = required;
      continue;
    }
    if (k === "name") {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        !value.first?.trim() ||
        !value.last?.trim()
      )
        errors[f.id] = required;
      continue;
    }
    if (k === "check") {
      if (value !== true) errors[f.id] = required;
      continue;
    }
    if (k === "multi") {
      if (
        !Array.isArray(value) ||
        !value.length ||
        value.some((x) => !options(f.id, "es").some((o) => o.value === x))
      )
        errors[f.id] = required;
      continue;
    }
    if (typeof value !== "string" || !value.trim()) {
      if (f.required) errors[f.id] = required;
      continue;
    }
    if (k === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      errors[f.id] = t(
        language,
        "Ingresa un correo válido.",
        "Enter a valid email.",
      );
    if (
      k === "phone" &&
      (!/^\+[1-9][\d\s().-]{6,24}$/.test(value) ||
        !/^\+[1-9]\d{6,14}$/.test(value.replace(/[\s().-]/g, "")))
    )
      errors[f.id] = t(
        language,
        "Incluye la clave de país, por ejemplo +52.",
        "Include the country code, for example +1.",
      );
    if (k === "radio" && !options(f.id, "es").some((o) => o.value === value))
      errors[f.id] = required;
    if (k === "country" && !countryCodes.includes(value))
      errors[f.id] = required;
    if (f.id === "or_detalle" && value.trim().length < 20)
      errors[f.id] = t(
        language,
        "Escribe al menos 20 caracteres.",
        "Enter at least 20 characters.",
      );
  }
  return errors;
}
export function displayAnswer(
  value: Answer | undefined,
  language: Language,
  id: string,
) {
  if (value === undefined) return "—";
  if (typeof value === "boolean")
    return t(language, value ? "Sí" : "No", value ? "Yes" : "No");
  if (Array.isArray(value))
    return value
      .map((x) => options(id, language).find((o) => o.value === x)?.label || x)
      .join(", ");
  if (typeof value === "object")
    return [value.first, value.last, value.second].filter(Boolean).join(" ");
  if (fields.find((f) => f.id === id)?.type === "Dropdown")
    return countries(language).find((o) => o.value === value)?.label || value;
  return options(id, language).find((o) => o.value === value)?.label || value;
}
