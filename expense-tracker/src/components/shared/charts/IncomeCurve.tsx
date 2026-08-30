'use client';

import { CURRENCY_META, type Currency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { useId, useState } from 'react';
import { INCOME, money, type FlowPoint } from './FlowBars';

interface Props {
  points: FlowPoint[];
  currency: Currency;
  title: string;
  /** Итог за период — крупным числом под заголовком */
  total: number;
  /** Подпись справа от заголовка: период, к которому относится итог */
  period?: string;
  hint: string;
  emptyText: string;
  className?: string;
}

// Верх графика оставлен пустым: кривая, упирающаяся в край, читается как
// обрезанная. 88 из 100 — пик, 100 — ноль.
const PLOT = 88;

/**
 * Плавная кривая дохода по неделям. Сглаживание — Catmull-Rom, переведённый
 * в кубические Безье: по точкам проходит ровно, а между ними идёт волной,
 * а не ломаной.
 *
 * Управляющие точки прижаты к полю графика, иначе на резком спаде кривая
 * ныряет ниже нуля — дохода меньше нуля не бывает, и такая петля врёт.
 */
// Точки стоят по центрам колонок, а не по краям поля: под графиком те же
// колонки с подписями недель, и иначе точка и её подпись не совпадали бы.
export const columnX = (index: number, count: number) => ((index + 0.5) / count) * 100;

const buildPath = (values: number[]) => {
  if (values.length === 0) return '';
  const clamp = (value: number) => Math.min(Math.max(value, 100 - PLOT), 100);
  const y = (value: number) => clamp(100 - value * PLOT);

  const points = values.map((value, index) => ({
    x: columnX(index, values.length),
    y: y(value),
  }));
  if (points.length === 1) {
    // Одна точка — рисуем короткую горизонталь, иначе не видно ничего.
    return `M 0 ${points[0].y} L 100 ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];
    const cp1 = { x: p1.x + (p2.x - p0.x) / 6, y: clamp(p1.y + (p2.y - p0.y) / 6) };
    const cp2 = { x: p2.x - (p3.x - p1.x) / 6, y: clamp(p2.y - (p3.y - p1.y) / 6) };
    path += ` C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p2.x} ${p2.y}`;
  }
  return path;
};

export const IncomeCurve: React.FC<Props> = ({
  points,
  currency,
  title,
  total,
  period,
  hint,
  emptyText,
  className,
}) => {
  const symbol = CURRENCY_META[currency].symbol;
  const [hovered, setHovered] = useState<string | null>(null);
  const gradientId = useId();

  const max = Math.max(...points.map((point) => point.income), 0);
  const active = points.find((point) => point.key === hovered);

  // См. FlowBars: касание браузер дублирует мышью, и mouseleave гасит
  // значение сразу после click.
  const pointerIn = (event: React.PointerEvent, key: string) => {
    if (event.pointerType === 'mouse') setHovered(key);
  };
  const pointerOut = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse') setHovered(null);
  };

  // Доли от максимума: сама геометрия не знает ни про валюту, ни про суммы.
  const shares = points.map((point) => (max > 0 ? point.income / max : 0));
  const line = buildPath(shares);
  const first = columnX(0, points.length);
  const last = columnX(points.length - 1, points.length);
  const area = line && points.length > 1 ? `${line} L ${last} 100 L ${first} 100 Z` : '';

  return (
    <section className={cn('rounded-2xl border border-gray-100 bg-white p-4 sm:p-6', className)}>
      {/* Один ряд — легенда не нужна, ряд назван заголовком. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {period ? <p className="text-sm text-gray-400">{period}</p> : null}
      </div>

      <p className="mt-2 text-3xl font-bold tabular-nums sm:text-4xl">
        {symbol}
        {money(total)}
      </p>

      {max === 0 ? (
        <p className="mt-6 text-gray-400">{emptyText}</p>
      ) : (
        <div className="mt-4">
          <div className="flex h-6 items-center justify-end text-sm tabular-nums">
            {active ? (
              <span className="font-semibold" style={{ color: INCOME }}>
                +{symbol}
                {money(active.income)}
              </span>
            ) : (
              <span className="text-gray-400">{hint}</span>
            )}
          </div>

          <div className="relative mt-2 h-[168px]">
            {/* preserveAspectRatio=none растягивает координаты по ширине —
                поэтому линия рисуется с non-scaling-stroke, а точки лежат
                обычным HTML: иначе и то и другое расплывалось бы. */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INCOME} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={INCOME} stopOpacity="0" />
                </linearGradient>
              </defs>
              {area ? <path d={area} fill={`url(#${gradientId})`} /> : null}
              <path
                d={line}
                fill="none"
                stroke={INCOME}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gray-200" />

            {points.map((point, index) => {
              const left = columnX(index, points.length);
              const bottom = shares[index] * PLOT;
              const isHovered = hovered === point.key;

              return (
                <div key={point.key}>
                  {/* Колонка попадания во всю высоту: по кружку в 7 пикселей
                      пальцем не попасть. */}
                  <button
                    type="button"
                    aria-label={`${point.fullLabel}: доход ${symbol}${money(point.income)}`}
                    onPointerEnter={(event) => pointerIn(event, point.key)}
                    onPointerLeave={pointerOut}
                    onFocus={() => setHovered(point.key)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setHovered(point.key)}
                    className="absolute top-0 bottom-0 -translate-x-1/2"
                    style={{ left: `${left}%`, width: `${100 / points.length}%` }}
                  />
                  {isHovered ? (
                    <div
                      className="pointer-events-none absolute top-0 bottom-0 w-px bg-gray-200"
                      style={{ left: `${left}%` }}
                    />
                  ) : null}
                  <span
                    className={cn(
                      'pointer-events-none absolute rounded-full border-2 bg-white transition-all',
                      isHovered ? 'h-3 w-3' : 'h-2 w-2'
                    )}
                    style={{
                      left: `${left}%`,
                      bottom: `${bottom}%`,
                      borderColor: INCOME,
                      transform: 'translate(-50%, 50%)',
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex">
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
