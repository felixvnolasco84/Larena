import type { Metadata } from "next";
import PrivacyNotice from "@/components/Kyc/PrivacyNotice";
import { privacyProfile } from "@/lib/kyc/privacy";
export const metadata: Metadata = {
  title: "Aviso de privacidad KYC · Larena",
  description:
    "Tratamiento de información y documentos del expediente KYC de Larena y OGC.",
};
export default function Page() {
  return <PrivacyNotice profile={privacyProfile(process.env)} />;
}
