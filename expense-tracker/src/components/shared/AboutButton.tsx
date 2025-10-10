'use client';
import { cn } from '@/lib/utils';
import { CircleArrowDown } from 'lucide-react';
import React from 'react';
interface Props {
  className?: string;
}
 
export const AboutButton: React.FC<Props> = ({ className }) => {
  const handleClick = () => {
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };
 
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      className={cn('flex  items-center align-center gap-2 bg-white/5 dark:bg-white/5 backdrop-blur-md border border-white/20 shadow-sm rounded-full px-4 py-2 hover:bg-white/10 hover:scale-105 transition-all', className)}
    >
      <span className="about-gradient text-2xl">Click to learn more</span>
      <CircleArrowDown color="white" className='hover:text-black' />
    </div>
  );
};
