import clsx from 'clsx';
import React from 'react';

type TitleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface Props {
  size?: TitleSize;
  className?: string;
  text: string;
}

export const Title: React.FC<Props> = ({ text, size = 'sm', className }) => {
  const mapTagBySize = {
    xs: 'h5',
    sm: 'h4',
    md: 'h3',
    lg: 'h2',
    xl: 'h1',
    '2xl': 'h1',
  } as const;

  // Меньший размер на телефоне, прежний — с sm и выше.
  const mapClassNameBySize = {
    xs: 'text-[14px] sm:text-[16px]',
    sm: 'text-[18px] sm:text-[22px]',
    md: 'text-[22px] sm:text-[26px]',
    lg: 'text-[26px] sm:text-[32px]',
    xl: 'text-[30px] sm:text-[40px]',
    '2xl': 'text-[34px] sm:text-[48px]',
  } as const;

  return React.createElement(
    mapTagBySize[size],
    { className: clsx(mapClassNameBySize[size], className) },
    text,
  );
};
