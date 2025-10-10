import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import { Title } from './Title';

interface Props {
  className?: string;
}

export const About: React.FC<Props> = ({ className }) => {
  return (
    <div id="about" className={cn('pb-15', className)}>
      <Title text="About Expense Tracker" size="lg" className="text-white font-bold text-center mb-15" />

      <div className="flex justify-around ">
        <Image src="/assets/About.webp" alt="about" width={500} height={500} className="border rounded-2xl" />
        <p className="text-gray-300  mx-20 text-lg">
          Expense Tracker is a simple and intuitive application designed to help you manage your personal finances effectively. With Expense Tracker, you can easily record your income and expenses,
          categorize your transactions, and gain insights into your spending habits. Whether you are looking to budget better, save for a goal, or simply keep track of where your money goes, Expense
          Tracker provides the tools you need to take control of your financial life.
        </p>
      </div>
    </div>
  );
};
