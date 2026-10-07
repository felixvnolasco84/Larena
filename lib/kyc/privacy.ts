export const PRIVACY_PATH = "/kyc/aviso-privacidad";
export const PRIVACY_VERSION = "larena-kyc-privacy-2026-10-06";
export type PrivacyProfile = { name: string; address: string; email: string };
export function privacyProfile(
  env: Record<string, string | undefined>,
): PrivacyProfile {
  return {
    name: env.KYC_CONTROLLER_NAME?.trim() || "",
    address: env.KYC_CONTROLLER_ADDRESS?.trim() || "",
    email: env.KYC_PRIVACY_EMAIL?.trim() || "",
  };
}
export function completePrivacyProfile(profile: PrivacyProfile) {
  return (
    profile.name.length >= 3 &&
    profile.address.length >= 10 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) &&
    ![profile.name, profile.address, profile.email].some((value) =>
      value.includes("["),
    )
  );
}
