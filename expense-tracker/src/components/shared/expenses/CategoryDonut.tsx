'use client';

import { CURRENCY_META, type Currency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export type CategorySlice = {
  id: string;
  name: string;
  amount: number;
  share: number;
  /** Свёрнутый хвост: серым, чтобы не спорил с настоящими категориями */
  muted?: boolean;
};

interface Props {
  slices: CategorySlice[];
  total: number;
  currency: Currency;
}

// Палитра проверена валидатором на белом фоне: полоса светлоты, порог
// насыщенности, различимость соседних пар при цветовой слепоте (худшая
// пара ΔE 9.1 при цели 8) и при обычном зрении (19.6 при пороге 15).
// Порядок фиксированный — цвет закреплён за местом в списке, а не
// подбирается заново на каждый месяц.
//
// Три цвета из шести не дотягивают до контраста 3:1 с белым, поэтому
// опознание не держится на цвете: рядом всегда есть подпись с названием
// и суммой.
const COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];
// «Остальные» — не категория, а остаток, поэтому нейтральный серый:
// цветной слот тратить на него незачем.
const MUTED = '#6b7280';

const colorOf = (slice: CategorySlice, index: number) =>
  slice.muted ? MUTED : COLORS[index % COLORS.length];

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Просвет между секторами: без него соседние цвета сливаются в одно пятно.
const GAP = 3;

const money = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const percent = (share: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: share < 0.1 ? 1 : 0 }).format(share);

export const CategoryDonut: React.FC<Props> = ({ slices, total, currency }) => {
  const [active, setActive] = useState<string | null>(null);
  const symbol = CURRENCY_META[currency].symbol;

  const shown = slices.find((slice) => slice.id === active) ?? null;
  // Один сектор — кольцо целиком, просвет тут не нужен и выглядел бы
  // как случайная зарубка.
  const solo = slices.length === 1;

  let offset = 0;
  const arcs = slices.map((slice, index) => {
    const length = (slice.share / 100) * CIRCUMFERENCE;
    const arc = {
      id: slice.id,
      color: colorOf(slice, index),
      // Совсем тонкие сектора всё равно должны быть видны хотя бы полоской.
      dash: solo ? CIRCUMFERENCE : Math.max(length - GAP, 1),
      offset,
    };
    offset += length;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="relative shrink-0">
        <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-56 sm:w-56" role="img"
          aria-label={`Расходы по категориям, всего ${symbol}${money(total)}`}>
          <g transform="rotate(-90 100 100)">
            {arcs.map((arc) => (
              <circle
                key={arc.id}
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={active === arc.id ? 32 : 26}
                strokeDasharray={`${arc.dash} ${CIRCUMFERENCE - arc.dash}`}
                strokeDashoffset={-arc.offset}
                className="cursor-pointer transition-[stroke-width] duration-150"
                onMouseEnter={() => setActive(arc.id)}
                onMouseLeave={() => setActive(null)}
              />
            ))}
          </g>
        </svg>

        {/* Центр показывает итог, а при наведении — категорию под рукой.
            Подсказка сбоку на телефоне всё равно не помещается. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <p className="text-xs text-gray-400">{shown ? shown.name : 'Всего'}</p>
          <p className="text-lg font-bold tabular-nums sm:text-xl">
            {symbol}
            {money(shown ? shown.amount : total)}
          </p>
          {shown ? (
            <p className="text-xs text-gray-400 tabular-nums">{percent(shown.share)}%</p>
          ) : null}
        </div>
      </div>

      <ul className="flex w-full flex-col gap-1">
        {slices.map((slice, index) => (
          <li key={slice.id}>
            <button
              type="button"
              onMouseEnter={() => setActive(slice.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(slice.id)}
              onBlur={() => setActive(null)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors',
                active === slice.id ? 'bg-gray-100' : 'hover:bg-gray-50'
              )}>
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: colorOf(slice, index) }}
              />
              <span className="min-w-0 flex-1 truncate text-sm">{slice.name}</span>
              <span className="shrink-0 text-sm tabular-nums text-gray-400">
                {percent(slice.share)}%
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {symbol}
                {money(slice.amount)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
