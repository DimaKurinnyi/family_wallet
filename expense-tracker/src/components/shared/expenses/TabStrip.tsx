'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export type Tab = {
  key: string;
  /** «Этот месяц», «авг», имя участника */
  label: string;
  /** Полная подпись для озвучки и подсказки */
  title: string;
  href: string;
};

interface Props {
  tabs: Tab[];
  activeKey: string;
  ariaLabel: string;
  /** Мельче и без заливки — для второго ряда, чтобы не спорил с первым */
  variant?: 'primary' | 'secondary';
}

/**
 * Лента-переключатель над сводкой. Ссылки, а не кнопки: выбор живёт в
 * адресе, поэтому страницу можно перезагрузить или отправить себе, и она
 * откроется в том же состоянии.
 */
export const TabStrip: React.FC<Props> = ({ tabs, activeKey, ariaLabel, variant = 'primary' }) => {
  const strip = useRef<HTMLDivElement>(null);

  // Активная вкладка может быть в конце ленты (текущий месяц — последний),
  // поэтому подкручиваем к ней: иначе при заходе видно только прошлый год.
  useEffect(() => {
    const box = strip.current;
    const active = box?.querySelector<HTMLElement>('[data-active="true"]');
    if (!box || !active) return;
    const offset = active.getBoundingClientRect().left - box.getBoundingClientRect().left;
    box.scrollLeft += offset - box.clientWidth / 2 + active.clientWidth / 2;
  }, [activeKey]);

  const isPrimary = variant === 'primary';

  return (
    <div
      ref={strip}
      role="tablist"
      aria-label={ariaLabel}
      className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            scroll={false}
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            title={tab.title}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full font-medium transition-colors',
              isPrimary ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs',
              isActive
                ? isPrimary
                  ? 'bg-[#8144e9] text-white shadow-sm'
                  : 'bg-[#f2ecfd] text-[#8144e9] ring-1 ring-[#8144e9]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};
