'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useCurrencyStore } from '@/store/useCurrencyStore';
import { BadgeEuro, BanknoteArrowUp, Bus, Clapperboard, Utensils } from 'lucide-react';

interface Props{
  className?:string
  title?:string
}

const transactions = [
  { id: 1, icon: <Bus />, amount: 20, date: '12:25 PM', status: 'expenses', category: 'transport' },
  { id: 2, icon: <Utensils />, amount: 50, date: '1:00 PM', status: 'expenses', category: 'food' },
  { id: 3, icon: <BadgeEuro />, amount: 500, date: '2:30 PM', status: 'income', category: 'salary' },
  { id: 4, icon: <Clapperboard />, amount: 15, date: '3:45 PM', status: 'expenses', category: 'entertainment' },
  { id: 5, icon: <Clapperboard />, amount: 15, date: '4:00 PM', status: 'expenses', category: 'entertainment' },
  { id: 6, icon: <BanknoteArrowUp />, amount: 30, date: '5:15 PM', status: 'expenses', category: 'bills' },
];
export const Transactions: React.FC<Props> = ({className,title}) => {
  const { symbol } = useCurrencyStore();
  return (
    <div className={cn(" mt-20   ", className)}>
      <div className=" flex justify-between items-center mx-8">
        <h2 className="font-semibold text-2xl">{title}</h2>

        <Button variant="link" className="text-gray-400 text-md font-extralight">
          See All
        </Button>
      </div>
      <div className="mx-8">
        {transactions.map((transaction) => (
          <div key={transaction.id} className=" flex justify-between items-center mt-6">
            <div className=" flex items-center gap-4">
              <div className=" p-3 bg-gray-100 rounded-lg text-gray-600">{transaction.icon}</div>
              <div className='flex flex-col gap-1'>
                <p className=" font-medium text-md capitalize">{transaction.category}</p>
                <p className=" text-sm text-gray-400">{transaction.date}</p>
              </div>
            </div>
            <div>
              <p className={` font-semibold text-md ${transaction.status === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                {transaction.status === 'income' ? `+${symbol}${transaction.amount}` : `-${symbol}${transaction.amount}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
