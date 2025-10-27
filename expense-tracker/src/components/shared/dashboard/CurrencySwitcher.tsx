"use client";
import type { Currency } from "@/store/useCurrencyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";

export default function CurrencySwitcher() {
  const { currency, setCurrency, icon } = useCurrencyStore();

  type CurrencyOption = {
    code: Currency;
    name: string;
    icon: string;
  };

  const currencies: CurrencyOption[] = [
    { code: "USD", name: "Dollar", icon: "💵" },
    { code: "EUR", name: "Euro", icon: "💶" },
    { code: "UAH", name: "Hryvnia", icon: "🇺🇦" },
    { code: "PLN", name: "Zloty", icon: "🇵🇱" },
  ];

  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="border rounded-md px-2 py-1 text-sm bg-transparent"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
             {c.code}
          </option>
        ))}
      </select>
    </div>
  );
}
