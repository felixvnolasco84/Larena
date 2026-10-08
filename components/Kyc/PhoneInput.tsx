"use client";
import { useMemo, useState } from "react";
import { t, type Language } from "@/lib/kyc/model";
import {
  phoneCountry, nationalPhone, internationalPhone, phoneCountryOptions,
  getCountryCallingCode, type CountryCode,
} from "@/lib/kyc/phone";
import KycSelect from "./Select";

type PhoneInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  language: Language;
  name?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export default function PhoneInput({ id, value, onChange, language, name, disabled, ...aria }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => phoneCountry(value));
  const country = phoneCountry(value, selectedCountry);
  const countryOptions = useMemo(() => phoneCountryOptions(language), [language]);
  const number = nationalPhone(value, country);
  const describedBy = [`${id}-help`, aria["aria-describedby"]].filter(Boolean).join(" ");
  return <>
    <div className="kyc-phone">
      <KycSelect
        id={`${id}-country`}
        value={country}
        selectedLabel={`${country} +${getCountryCallingCode(country)}`}
        options={countryOptions}
        contentClassName="kyc-phone-countries"
        onValueChange={(next) => {
          const nextCountry = next as CountryCode;
          setSelectedCountry(nextCountry);
          onChange(internationalPhone(number, nextCountry));
        }}
        disabled={disabled}
        aria-label={t(language, "País de la clave telefónica", "Phone country code")}
        aria-invalid={aria["aria-invalid"]}
        aria-describedby={describedBy}
      />
      <input
        id={id}
        className="kyc-input"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={number}
        placeholder={t(language, "Número de teléfono", "Phone number")}
        onChange={(event) => {
          const next = event.target.value;
          if (next.trim().startsWith("+")) setSelectedCountry(phoneCountry(next, country));
          onChange(internationalPhone(next, country));
        }}
        disabled={disabled}
        aria-invalid={aria["aria-invalid"]}
        aria-describedby={describedBy}
        maxLength={30}
      />
      {name && <input type="hidden" name={name} value={value} />}
    </div>
    <span id={`${id}-help`} className="kyc-helper">
      {t(language, "Selecciona el país y escribe el número sin la clave.", "Select the country and enter the number without the country code.")}
    </span>
  </>;
}
