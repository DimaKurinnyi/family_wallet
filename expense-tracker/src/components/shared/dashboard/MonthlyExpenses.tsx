'use client';

import { cn } from '@/lib/utils';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useState } from 'react';

export type MonthPoint = {
  key: string;
  label: string;
  fullLabel: string;
  total: number;
};

interface Props {
  months: MonthPoint[];
  className?: string;
}

// Один ряд данных — расходы. Цвет один, легенда не нужна: заголовок уже
// говорит, что показано. Оттенок — фирменный оранжевый расходов, слегка
// затемнённый до контраста 3:1 к белой подложке карточки.
const EXPENSE = '#e05c30';

const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const compact = (value: number) =>
  new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export const MonthlyExpenses: React.FC<Props> = ({ months, className }) => {
  const { symbol } = useCurrencyStore();
  const [hovered, setHovered] = useState<string | null>(null);

  const max = Math.max(...months.map((month) => month.total), 0);
  const spent = months.reduce((sum, month) => sum + month.total, 0);
  const withSpending = months.filter((month) => month.total > 0).length;
  const average = withSpending > 0 ? spent / withSpending : 0;

  // Подписываем только самый высокий столбец: число на каждом превращает
  // график в таблицу, а остальные значения показывает наведение.
  const peakKey = max > 0 ? months.find((month) => month.total === max)?.key : undefined;

  return (
    <section className={cn('rounded-2xl border border-gray-100 bg-white p-4 sm:p-6', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold text-gray-800">Расходы по месяцам</h2>
        {max > 0 ? (
          <p className="text-sm text-gray-500">
            в среднем {symbol}
            {money(average)}
          </p>
        ) : null}
      </div>

      {max === 0 ? (
        <p className="mt-6 text-gray-400">Пока нет расходов — здесь появятся столбцы по месяцам.</p>
      ) : (
        <div className="mt-6">
          {/* pt-7 — запас под подпись самого высокого столбца. Подписи
              позиционируются абсолютно и в поток не входят: пока они были
              соседями столбца, подпись отнимала у него высоту, и самый
              высокий столбец рисовался короче своей доли. */}
          <div className="relative flex h-[168px] items-end gap-[2px] pt-7">
            {/* Базовая линия — тонкая и приглушённая, чтобы не спорить с данными */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gray-200" />

            {months.map((month) => {
              const height = max > 0 ? (month.total / max) * 100 : 0;
              const isHovered = hovered === month.key;
              const isPeak = month.key === peakKey;

              return (
                <div
                  key={month.key}
                  className="relative h-full flex-1"
                  onMouseEnter={() => setHovered(month.key)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(month.key)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${month.fullLabel}: ${symbol}${money(month.total)}`}>
                  {isPeak || isHovered ? (
                    <span
                      className={cn(
                        'absolute inset-x-0 whitespace-nowrap text-center text-xs font-semibold tabular-nums',
                        isHovered ? 'text-gray-800' : 'text-gray-600'
                      )}
                      style={{ bottom: `calc(${height}% + 6px)` }}>
                      {symbol}
                      {isHovered ? money(month.total) : compact(month.total)}
                    </span>
                  ) : null}

                  <div
                    className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[24px] rounded-t-[4px] transition-opacity"
                    style={{
                      height: `${height}%`,
                      minHeight: month.total > 0 ? 3 : 0,
                      background: EXPENSE,
                      opacity: hovered && !isHovered ? 0.55 : 1,
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex gap-[2px]">
            {months.map((month) => (
              <p
                key={month.key}
                className={cn(
                  'flex-1 text-center text-xs',
                  hovered === month.key ? 'font-semibold text-gray-700' : 'text-gray-400'
                )}>
                {month.label}
              </p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
