import { cn } from '@/lib/utils';
import React from 'react';
import {  AboutButton } from './AboutButton';
import { ButtonGroup } from './ButtonGroup';
import { Title } from './Title';
interface Props {
  className?: string;
}

export const HomeTitle: React.FC<Props> = ({ className }) => {
  return (
    <div className={cn(' flex flex-col items-center justify-center min-h-screen', className)}>
      <Title text="Welcome to Expense Tracker" size="2xl" className="text-white font-bold" />
      <Title text="create-next-app for you and your family" size="sm" className="text-gray-900 font-medium" />
      <ButtonGroup />

      <AboutButton className="mt-6" />
    </div>
  );
};
