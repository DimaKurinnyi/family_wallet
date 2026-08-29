'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface Props {
  active: boolean;
  label?: string;
  children: React.ReactNode;
  className?: string;
}

// Старое содержимое остаётся на месте и приглушается, а не исчезает:
// так блок не схлопывается и страница не прыгает, пока едут новые данные.
export const LoadingOverlay: React.FC<Props> = ({ active, label = 'Обновляем', children, className }) => {
  return (
    <div className={cn('relative', className)}>
      <div
        aria-busy={active}
        className={cn('transition-opacity', active && 'pointer-events-none select-none opacity-35')}>
        {children}
      </div>

      {active ? (
        <div className="absolute inset-0 flex items-start justify-center pt-16" role="status">
          <span className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-gray-600 shadow-md ring-1 ring-gray-100">
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            {label}
          </span>
        </div>
      ) : null}
    </div>
  );
};
