import { CircleArrowDown } from 'lucide-react';
import React from 'react';
interface Props {
  className?: string;
}

export const About: React.FC<Props> = ({ className }) => {
  return (
    <div className={'flex  items-center align-center gap-2 bg-white/5 dark:bg-white/5 backdrop-blur-md border border-white/20 shadow-sm rounded-full px-4 py-2 ' + className}>
      <span className="about-gradient text-2xl">Click to learn more</span>
      <CircleArrowDown color="white" />
    </div>
  );
};
