"use client";

import { cn } from "@/lib/utils";
import { CURRENCY_META, type Currency } from "@/lib/currency";
import { LoadingOverlay } from "./LoadingOverlay";
import { useWalletSwitch } from "./WalletSwitchContext";
import { useState } from "react";

export type MonthPoint = {
  key: string;
  label: string;
  fullLabel: string;
  income: number;
  expense: number;
};

interface Props {
  months: MonthPoint[];
  className?: string;
  currency: Currency;
}

// Два ряда данных, поэтому цвета проверены валидатором палитры на
// различимость при цветовой слепоте. Красный с зелёным — как раз тот
// случай, который для дальтоников сливается: у этой пары запас 7.4 при
// цели 8, то есть цвет сам по себе опознание не держит.
//
// Держит его позиция: доход всегда слева, расход всегда справа, в каждом
// месяце одинаково. Плюс легенда и подписи при наведении. Позиция
// читается независимо от цветовосприятия.
const INCOME = "#177d4a";
const EXPENSE = "#d13b2e";

const money = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const MonthlyFlow: React.FC<Props> = ({ months, className, currency }) => {
  const symbol = CURRENCY_META[currency].symbol;
  const [hovered, setHovered] = useState<string | null>(null);
  const { isSwitching } = useWalletSwitch();

  const max = Math.max(
    ...months.flatMap((month) => [month.income, month.expense]),
    0,
  );
  const active = months.find((month) => month.key === hovered);

  return (
    <LoadingOverlay
      active={isSwitching}
      label="Обновляем график"
      className={className}
    >
      <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Доходы и расходы
          </h2>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: INCOME }}
              />
              Доход
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: EXPENSE }}
              />
              Расход
            </span>
          </div>
        </div>

        {max === 0 ? (
          <p className="mt-6 text-gray-400">
            Пока нет операций — здесь появятся столбцы по месяцам.
          </p>
        ) : (
          <div className="mt-4">
            {/* Строка значений фиксированной высоты: если показывать её только
              при наведении, график дёргается вверх-вниз. */}
            <div className="flex h-6 items-center justify-end gap-4 text-sm tabular-nums">
              {active ? (
                <>
                  <span className="font-semibold" style={{ color: INCOME }}>
                    +{symbol}
                    {money(active.income)}
                  </span>
                  <span className="font-semibold" style={{ color: EXPENSE }}>
                    −{symbol}
                    {money(active.expense)}
                  </span>
                </>
              ) : (
                <span className="text-gray-400">Наведите на месяц</span>
              )}
            </div>

            <div className="relative mt-2 flex h-[168px] items-end gap-2">
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gray-200" />

              {months.map((month) => {
                const isHovered = hovered === month.key;
                const dim = hovered !== null && !isHovered;

                return (
                  <div
                    key={month.key}
                    className="relative flex h-full flex-1 items-end justify-center gap-[2px]"
                    onMouseEnter={() => setHovered(month.key)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(month.key)}
                    onBlur={() => setHovered(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${month.fullLabel}: доход ${symbol}${money(month.income)}, расход ${symbol}${money(month.expense)}`}
                  >
                    {/* Порядок неслучаен: доход слева, расход справа — всегда. */}
                    {(
                      [
                        { value: month.income, color: INCOME },
                        { value: month.expense, color: EXPENSE },
                      ] as const
                    ).map((bar, index) => (
                      <div
                        key={index}
                        className="w-full max-w-[16px] rounded-t-[4px] transition-opacity"
                        style={{
                          height: `${max > 0 ? (bar.value / max) * 100 : 0}%`,
                          minHeight: bar.value > 0 ? 3 : 0,
                          background: bar.color,
                          opacity: dim ? 0.45 : 1,
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex gap-2">
              {months.map((month) => (
                <p
                  key={month.key}
                  className={cn(
                    "flex-1 text-center text-xs",
                    hovered === month.key
                      ? "font-semibold text-gray-700"
                      : "text-gray-400",
                  )}
                >
                  {month.label}
                </p>
              ))}
            </div>
          </div>
        )}
      </section>
    </LoadingOverlay>
  );
};
