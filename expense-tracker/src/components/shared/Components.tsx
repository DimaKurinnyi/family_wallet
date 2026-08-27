import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

export const Components: React.FC<React.PropsWithChildren<Props>> = ({ className, children, style }) => {
  return (
    <div className={cn('mx-auto max-w-[1280px] px-4 sm:px-6', className)} style={style}>
      {children}
    </div>
  );
};
