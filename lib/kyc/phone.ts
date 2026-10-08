import { AsYouType, getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js/min";
import { type Language } from "./model";

const phoneCountries = getCountries();

export function phoneCountry(value: string, fallback: CountryCode = "MX"): CountryCode {
  if (!value.trim().startsWith("+")) return fallback;
  const phone = new AsYouType();
  phone.input(value);
  const callingCode = phone.getCallingCode();
  if (!callingCode) return fallback;
  if (getCountryCallingCode(fallback) === callingCode) return fallback;
  return phone.getCountry()
    || ({ "1": "US", "7": "RU", "44": "GB" } as Record<string, CountryCode>)[callingCode]
    || phoneCountries.find((country) => getCountryCallingCode(country) === callingCode)
    || fallback;
}

export function nationalPhone(value: string, country: CountryCode) {
  // Strip only the selected calling code; never reinterpret an existing local number.
  const prefix = `+${getCountryCallingCode(country)}`;
  return value.trimStart().startsWith(prefix) ? value.trimStart().slice(prefix.length).trimStart() : value;
}

export function internationalPhone(number: string, country: CountryCode) {
  if (!number.trim()) return "";
  if (number.trimStart().startsWith("+")) return number.trimStart();
  return `+${getCountryCallingCode(country)} ${number.trimStart()}`;
}

export function phoneCountryOptions(language: Language) {
  const names = new Intl.DisplayNames([language], { type: "region" });
  return phoneCountries.map((value) => ({
    value,
    label: `${names.of(value) || value} (+${getCountryCallingCode(value)})`,
  })).sort((a, b) => a.label.localeCompare(b.label, language));
}

export { getCountryCallingCode, type CountryCode };
