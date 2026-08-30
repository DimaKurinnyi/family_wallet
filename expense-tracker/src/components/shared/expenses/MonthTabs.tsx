'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export type MonthTab = {
  key: string;
  /** «Этот месяц», «авг», «июль 2025» */
  label: string;
  /** Полное название для озвучки и подсказки */
  title: string;
};

interface Props {
  months: MonthTab[];
  activeKey: string;
}

/**
 * Лента месяцев над сводкой. Ссылки, а не кнопки: месяц живёт в адресе,
 * поэтому страницу можно перезагрузить или отправить себе, и она откроется
 * на том же месяце.
 */
export const MonthTabs: React.FC<Props> = ({ months, activeKey }) => {
  const strip = useRef<HTMLDivElement>(null);

  // Текущий месяц в конце ленты — прокручиваем к нему, иначе при заходе
  // видно только прошлый год.
  useEffect(() => {
    const box = strip.current;
    const active = box?.querySelector<HTMLElement>('[data-active="true"]');
    if (!box || !active) return;
    const offset = active.getBoundingClientRect().left - box.getBoundingClientRect().left;
    box.scrollLeft += offset - box.clientWidth / 2 + active.clientWidth / 2;
  }, [activeKey]);

  return (
    <div
      ref={strip}
      role="tablist"
      aria-label="Месяц"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {months.map((month) => {
        const isActive = month.key === activeKey;
        return (
          <Link
            key={month.key}
            href={`/expenses?m=${month.key}`}
            scroll={false}
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            title={month.title}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#8144e9] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}>
            {month.label}
          </Link>
        );
      })}
    </div>
  );
};
