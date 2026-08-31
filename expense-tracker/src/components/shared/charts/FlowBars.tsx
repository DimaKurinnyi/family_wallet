'use client';

import { CURRENCY_META, type Currency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export type FlowPoint = {
  key: string;
  label: string;
  fullLabel: string;
  income: number;
  expense: number;
};

// Два ряда данных, поэтому цвета проверены валидатором палитры на
// различимость при цветовой слепоте. Красный с зелёным — как раз тот
// случай, который для дальтоников сливается: у этой пары запас 7.4 при
// цели 8, то есть цвет сам по себе опознание не держит.
//
// Держит его позиция: доход всегда слева, расход всегда справа, в каждом
// столбце одинаково. Плюс легенда и подписи при наведении. Позиция
// читается независимо от цветовосприятия.
export const INCOME = '#177d4a';
export const EXPENSE = '#d13b2e';

export const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface Props {
  points: FlowPoint[];
  currency: Currency;
  title: string;
  /** Подсказка в строке значений, пока никуда не навели */
  hint: string;
  emptyText: string;
  /**
   * Итог за весь период под заголовком: остаток и из чего он сложился.
   * Без него рисуется обычная легенда — на дашборде столбцы охватывают
   * полгода, и «за месяц» там сказать не о чем.
   */
  summary?: { label: string; income: number; expense: number };
  className?: string;
}

/** Парные столбцы «доход — расход» по периодам. Общая для месяцев и недель. */
export const FlowBars: React.FC<Props> = ({
  points,
  currency,
  title,
  hint,
  emptyText,
  summary,
  className,
}) => {
  const symbol = CURRENCY_META[currency].symbol;
  const [hovered, setHovered] = useState<string | null>(null);

  const max = Math.max(...points.flatMap((point) => [point.income, point.expense]), 0);
  const active = points.find((point) => point.key === hovered);

  // Касание браузер дублирует мышиными событиями, и mouseleave прилетает
  // сразу после click — значения успевали мигнуть и пропасть. Поэтому
  // наведение слушаем только у настоящей мыши, а касание ловит click.
  const pointerIn = (event: React.PointerEvent, key: string) => {
    if (event.pointerType === 'mouse') setHovered(key);
  };
  const pointerOut = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse') setHovered(null);
  };

  const balance = summary ? summary.income - summary.expense : 0;

  return (
    <section className={cn('rounded-2xl border border-gray-100 bg-white p-4 sm:p-6', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

        {/* Со сводкой отдельная легенда не нужна: те же два цвета стоят там
            рядом с названиями и суммами, а стрелка задаёт направление. */}
        {summary ? null : (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: INCOME }} />
              Доход
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: EXPENSE }} />
              Расход
            </span>
          </div>
        )}
      </div>

      {summary ? (
        <div className="mt-2">
          <p className="text-sm text-gray-400">{summary.label}</p>
          {/* Минус выносим перед символом валюты: «−$480,00», а не «$−480,00» */}
          <p className="text-3xl font-bold tabular-nums sm:text-4xl">
            {balance < 0 ? '−' : ''}
            {symbol}
            {money(Math.abs(balance))}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm tabular-nums">
            <span className="flex items-center gap-1 font-medium" style={{ color: INCOME }}>
              <ChevronUp className="h-4 w-4" />
              Доход {symbol}
              {money(summary.income)}
            </span>
            <span className="flex items-center gap-1 font-medium" style={{ color: EXPENSE }}>
              <ChevronDown className="h-4 w-4" />
              Расход {symbol}
              {money(summary.expense)}
            </span>
          </div>
        </div>
      ) : null}

      {max === 0 ? (
        <p className="mt-6 text-gray-400">{emptyText}</p>
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
              <span className="text-gray-400">{hint}</span>
            )}
          </div>

          <div className="relative mt-2 flex h-[168px] items-end gap-2">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gray-200" />

            {points.map((point) => {
              const isHovered = hovered === point.key;
              const dim = hovered !== null && !isHovered;

              return (
                <div
                  key={point.key}
                  className="relative flex h-full flex-1 items-end justify-center gap-[2px]"
                  onPointerEnter={(event) => pointerIn(event, point.key)}
                  onPointerLeave={pointerOut}
                  onFocus={() => setHovered(point.key)}
                  onBlur={() => setHovered(null)}
                  onClick={() => setHovered(point.key)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${point.fullLabel}: доход ${symbol}${money(point.income)}, расход ${symbol}${money(point.expense)}`}>
                  {/* Порядок неслучаен: доход слева, расход справа — всегда. */}
                  {(
                    [
                      { value: point.income, color: INCOME },
                      { value: point.expense, color: EXPENSE },
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
            {points.map((point) => (
              <p
                key={point.key}
                className={cn(
                  'flex-1 text-center text-xs',
                  hovered === point.key ? 'font-semibold text-gray-700' : 'text-gray-400'
                )}>
                {point.label}
              </p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
