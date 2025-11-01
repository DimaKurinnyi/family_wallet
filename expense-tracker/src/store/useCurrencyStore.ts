import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "USD" | "EUR" | "UAH" | "PLN";
 
interface CurrencyState {
  currency: Currency;
  symbol: string;
  icon: string;
  setCurrency: (currency: Currency) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist<CurrencyState>(
    (set) => ({
      currency: "USD",
      symbol: "$",
      icon: "💵",
      setCurrency: (currency: Currency) => {
        const map: Record<Currency, { symbol: string; icon: string }> = {
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
