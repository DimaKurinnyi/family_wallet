import { create } from "zustand";
import { persist } from "zustand/middleware";

type CurrencyKey = "USD" | "EUR" | "UAH" | "PLN";

interface CurrencyState {
  currency: CurrencyKey;
  symbol: string;
  icon: string;
  setCurrency: (currency: CurrencyKey) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist<CurrencyState>(
    (set) => ({
      currency: "USD",
      symbol: "$",
      icon: "💵",
      setCurrency: (currency: CurrencyKey) => {
        const map: Record<CurrencyKey, { symbol: string; icon: string }> = {
          USD: { symbol: "$", icon: "💵" },
          EUR: { symbol: "€", icon: "💶" },
          UAH: { symbol: "₴", icon: "🇺🇦" },
          PLN: { symbol: "zł", icon: "🇵🇱" },
        };
        set({ currency, ...map[currency] });
      },
    }),
    { name: "currency-storage" }
  )
);
