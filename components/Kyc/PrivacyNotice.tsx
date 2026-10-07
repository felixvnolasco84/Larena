"use client";
import { useState } from "react";
import { t, type Language } from "@/lib/kyc/model";
import { completePrivacyProfile, type PrivacyProfile } from "@/lib/kyc/privacy";
import KycSelect from "./Select";
const dataLaw = "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf";
const amlLaw = "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPIORPI.pdf";
export default function PrivacyNotice({
  profile,
}: {
  profile: PrivacyProfile;
}) {
  const [language, setLanguage] = useState<Language>("es");
  const ready = completePrivacyProfile(profile);
  const paragraph = (es: string, en: string) => t(language, es, en);
  return (
    <article lang={language} className="kyc-privacy">
      <div className="kyc-toolbar">
        <div className="kyc-eyebrow">LARENA · OGC · KYC</div>
        <div className="kyc-language">
          <label htmlFor="privacy-language">{paragraph("Idioma", "Language")}</label>
          <KycSelect
            id="privacy-language"
            compact
            aria-label="Idioma / Language"
            value={language}
            onValueChange={(value) => setLanguage(value as Language)}
            options={[{ value: "es", label: "ES" }, { value: "en", label: "EN" }]}
          />
        </div>
      </div>
      <h1>
        {paragraph("Aviso de privacidad integral", "Full Privacy Notice")}
      </h1>
      <p className="kyc-helper">
        {paragraph(
          "Expediente Conozca a su Cliente · Versión 6 de octubre de 2026",
          "Know Your Client file · Version October 6, 2026",
        )}
      </p>
      {!ready && (
        <div className="kyc-alert" role="status">
          <strong>
            {paragraph(
              "Borrador pendiente de completar",
              "Draft awaiting completion",
            )}
          </strong>
          <p>
            {paragraph(
              "La razón social, el domicilio del responsable y el canal de privacidad deben confirmarse antes de habilitar el formulario para compradores reales.",
              "The controller's legal name, address and privacy contact must be confirmed before the form is enabled for real buyers.",
            )}
          </p>
        </div>
      )}
      <div className="kyc-panel">
        <section>
          <h2>
            {paragraph(
              "1. Responsable y contacto",
              "1. Controller and contact",
            )}
          </h2>
          <p>
            {paragraph(
              "Este aviso corresponde al expediente KYC del proyecto Larena, gestionado por OGC.",
              "This notice covers the Larena project's KYC file, managed by OGC.",
            )}
          </p>
          <dl className="kyc-privacy-profile">
            <dt>
              {paragraph(
                "Razón social del responsable",
                "Controller's legal name",
              )}
            </dt>
            <dd>
              {profile.name || paragraph("Por confirmar", "To be confirmed")}
            </dd>
            <dt>{paragraph("Domicilio completo", "Full address")}</dt>
            <dd>
              {profile.address || paragraph("Por confirmar", "To be confirmed")}
            </dd>
            <dt>{paragraph("Atención de privacidad", "Privacy contact")}</dt>
            <dd>
              {profile.email ? (
                <a className="kyc-link" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
              ) : (
                paragraph("Canal por confirmar", "Contact to be confirmed")
              )}
            </dd>
          </dl>
        </section>
        <section>
          <h2>
            {paragraph(
              "2. Información que se recaba",
              "2. Information collected",
            )}
          </h2>
          <p>
            {paragraph(
              "Según el tipo de comprador y la operación, el expediente puede incluir nombre o razón social, estado civil, correo, teléfono, ocupación, actividad económica, empresa, residencia fiscal e identificadores fiscales; información del representante, beneficiario controlador y titular de la cuenta pagadora; origen de los recursos, banco, país y forma de pago; cargos públicos y vínculos con personas políticamente expuestas.",
              "Depending on the buyer and transaction, the file may include name or company name, marital status, email, phone, occupation, business activity, employer, tax residence and tax identifiers; information about representatives, beneficial owners and the paying account holder; source of funds, bank, country and payment method; public offices and relationships with politically exposed persons.",
            )}
          </p>
          <p>
            {paragraph(
              "También se reciben las copias solicitadas de identificaciones, comprobantes de domicilio y fiscales, documentos societarios, poderes, estructura accionaria, soporte de recursos cuando se aporte y una imagen de la firma. Los datos financieros y patrimoniales forman parte del expediente. No se solicitan datos de salud, creencias, preferencia sexual u opiniones políticas; la declaración PEP se limita al cargo público y a los vínculos indicados.",
              "Requested copies of identity, address and tax documents, corporate documents, powers of attorney, ownership structure, any supplied source-of-funds evidence and a signature image are also collected. The file includes financial and asset information. Health, beliefs, sexual preference and political opinions are not requested; the PEP declaration covers the stated public office and relationships.",
            )}
          </p>
        </section>
        <section>
          <h2>{paragraph("3. Finalidades", "3. Purposes")}</h2>
          <p>
            {paragraph(
              "La información se utiliza para identificar al comprador y a las personas relacionadas con la operación, integrar y revisar el expediente, verificar lo declarado y sus documentos, atender obligaciones de prevención de lavado de dinero cuando correspondan, preparar la formalización de la compra y comunicarse sobre documentos faltantes o el estado del expediente. Este formulario no solicita consentimiento para publicidad.",
              "Information is used to identify the buyer and people connected to the transaction, compile and review the file, verify declarations and documents, meet applicable anti-money-laundering duties, prepare the purchase formalization and communicate about missing documents or file status. This form does not request advertising consent.",
            )}
          </p>
          <p>
            {paragraph(
              "Las verificaciones se realizan por el equipo autorizado. El envío del formulario no constituye una aprobación automática de la operación.",
              "Checks are performed by authorized staff. Submitting the form does not automatically approve the transaction.",
            )}
          </p>
        </section>
        <section>
          <h2>
            {paragraph(
              "4. Acceso, proveedores y transferencias",
              "4. Access, service providers and disclosures",
            )}
          </h2>
          <p>
            {paragraph(
              "El expediente está disponible para el personal autorizado de OGC. Convex presta los servicios de almacenamiento y gestión del formulario; Resend presta el servicio de correos. Estos proveedores actúan por cuenta del responsable y sus servicios pueden procesar información fuera de México. Las notificaciones no incluyen documentos adjuntos.",
              "The file is available to authorized OGC staff. Convex provides form data and document storage; Resend provides email delivery. These providers act on the controller's behalf and may process information outside Mexico. Notifications do not attach documents.",
            )}
          </p>
          <p>
            {paragraph(
              "Los datos podrán comunicarse a autoridades competentes cuando una obligación legal o requerimiento válido lo exija, y a quienes intervengan en la formalización cuando proceda conforme a la ley. Cualquier transferencia que requiera un consentimiento adicional se informará antes de realizarla. Los datos del expediente no se venden.",
              "Information may be disclosed to competent authorities where required by law or a valid request, and to participants in the formalization where legally applicable. Any disclosure requiring additional consent will be explained before it occurs. File data is not sold.",
            )}
          </p>
        </section>
        <section>
          <h2>
            {paragraph(
              "5. Borradores, seguridad y conservación",
              "5. Drafts, security and retention",
            )}
          </h2>
          <p>
            {paragraph(
              "El avance y los documentos se guardan al completar el formulario para permitir retomarlo con el mismo enlace. El enlace es personal: compartirlo permite acceder al borrador. Su vencimiento o revocación impide el acceso mediante ese enlace, sin borrar automáticamente el expediente. El acceso del personal requiere autenticación y autorización.",
              "Progress and documents are saved as the form is completed, allowing the buyer to resume with the same link. The link is personal: sharing it allows access to the draft. Expiration or revocation blocks link access without automatically deleting the file. Staff access requires authentication and authorization.",
            )}
          </p>
          <p>
            {paragraph(
              "La conservación se sujeta a las obligaciones legales y contractuales aplicables. Para expedientes sujetos al artículo 18 de la LFPIORPI, el plazo mínimo previsto es de diez años a partir de la actividad vulnerable, sujeto a los supuestos legales que interrumpen o amplían ese plazo. Los borradores sin operación se revisarán conforme a la política que establezca el responsable.",
              "Retention follows applicable legal and contractual duties. For files subject to Article 18 of the LFPIORPI, the statutory minimum is ten years from the regulated activity, subject to legal circumstances that interrupt or extend that period. Drafts without a transaction will be reviewed under the controller's retention policy.",
            )}
          </p>
        </section>
        <section>
          <h2>
            {paragraph(
              "6. Derechos ARCO y revocación",
              "6. ARCO rights and withdrawal",
            )}
          </h2>
          <p>
            {paragraph(
              "Puedes solicitar acceso, rectificación, cancelación u oposición, revocar tu consentimiento o limitar el uso o divulgación mediante el contacto de privacidad indicado arriba. Incluye nombre, medio para recibir respuesta, descripción de la solicitud y acreditación de identidad o representación; para rectificar, indica el cambio y su soporte. Se te indicará un medio seguro para entregar documentación.",
              "You may request access, correction, cancellation or objection, withdraw consent, or limit use or disclosure through the privacy contact above. Provide your name, a reply channel, a description of the request and proof of identity or representation; for corrections, specify the change and supporting evidence. A secure document submission method will be provided.",
            )}
          </p>
          <p>
            {paragraph(
              "La determinación de una solicitud ARCO se comunicará en un máximo de veinte días hábiles y, si procede, se ejecutará dentro de los quince días hábiles siguientes, con las ampliaciones legalmente justificadas. La revocación no tiene efectos retroactivos y la cancelación puede estar limitada por deberes legales de conservación.",
              "An ARCO request decision will be communicated within twenty business days and, if granted, implemented within the following fifteen business days, subject to legally justified extensions. Withdrawal has no retroactive effect and cancellation may be limited by legal retention duties.",
            )}
          </p>
        </section>
        <section>
          <h2>{paragraph("7. Consentimiento", "7. Consent")}</h2>
          <p>
            {paragraph(
              "El formulario presenta la aceptación del aviso, la autorización de verificaciones y la declaración de veracidad, junto con la firma. El responsable conserva la versión del aviso y la fecha del envío. El tratamiento financiero o patrimonial se apoya en el consentimiento expreso cuando se requiera, sin perjuicio de las excepciones legales. Si proporcionas datos de otra persona, debes contar con la autorización o representación correspondiente y ponerle este aviso a disposición.",
              "The form presents notice acceptance, verification authorization and an accuracy declaration, together with a signature. The controller retains the notice version and submission date. Financial or asset information is processed with express consent where required, subject to legal exceptions. If you supply another person's data, you must have the corresponding authorization or representation and make this notice available to them.",
            )}
          </p>
        </section>
        <section>
          <h2>
            {paragraph("8. Cambios y consultas", "8. Changes and questions")}
          </h2>
          <p>
            {paragraph(
              "Las actualizaciones se publicarán en esta misma página con una nueva fecha de versión. Los cambios que requieran un nuevo consentimiento se comunicarán antes de aplicar el nuevo tratamiento. Para consultas generales del proyecto puedes contactar a info@larena.mx; el canal que atienda derechos de privacidad es el indicado en el apartado 1.",
              "Updates will appear on this page with a new version date. Changes requiring renewed consent will be communicated before the new processing begins. General project questions can be sent to info@larena.mx; privacy rights are handled through the contact listed in section 1.",
            )}
          </p>
        </section>
        <p className="kyc-helper">
          {paragraph("Referencias normativas:", "Legal references:")}{" "}
          <a
            className="kyc-link"
            href={dataLaw}
            target="_blank"
            rel="noopener noreferrer"
          >
            LFPDPPP
          </a>{" "}
          ·{" "}
          <a
            className="kyc-link"
            href={amlLaw}
            target="_blank"
            rel="noopener noreferrer"
          >
            LFPIORPI
          </a>
        </p>
      </div>
    </article>
  );
}
