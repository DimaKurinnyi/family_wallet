'use client';

import { Ambulance, BadgeEuro, Banknote, BanknoteArrowUp, Bus, Clapperboard, Gift, GraduationCap, House, PackageOpen, ShieldPlus, ShoppingCart, Utensils } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
  transactionType?: 'income' | 'expense' | '';
}

const incomeCategories = [
  { id: 1, name: 'Salary', icon: <BadgeEuro /> },
  { id: 2, name: 'Freelance', icon: <Banknote /> },
  { id: 3, name: 'Investments', icon: <ShieldPlus /> },
  { id: 4, name: 'Gifts', icon: <Gift /> },
  { id: 5, name: 'Other', icon: <PackageOpen /> },
];

const expenseCategories = [
  { id: 1, name: 'Food', icon: <Utensils /> },
  { id: 2, name: 'Transport', icon: <Bus /> },
  { id: 3, name: 'Housing', icon: <House /> },
  { id: 4, name: 'Entertainment', icon: <Clapperboard /> },
  { id: 5, name: 'Other', icon: <PackageOpen /> },
  { id: 6, name: 'Bills', icon: <BanknoteArrowUp /> },
  { id: 7, name: 'Shopping', icon: <ShoppingCart /> },
  { id: 8, name: 'Health', icon: <Ambulance /> },
  { id: 9, name: 'Education', icon: <GraduationCap /> },
];

export const TransactionAdder: React.FC<Props> = ({ transactionType }) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const transformValue = transactionType === 'income' ? 'translateX(0%)' : 'translateX(-50%)';

  return (
    <div className="mt-6">
      <h2 className="">Choose category:</h2>

      <div className="m-3 overflow-hidden">
        <div className="flex w-[200%] transition-transform duration-300 ease-in-out" style={{ transform: transformValue }}>
          {/* Income panel */}
          <div className="w-1/2 flex-none">
            <div className="grid grid-cols-3 gap-3">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex flex-col items-center gap-2 p-2 hover:bg-[#f2ecfd] hover:rounded-lg hover:shadow-sm cursor-pointer ${
                    selectedCategory === category.id ? 'bg-[#f2ecfd] rounded-lg' : ''
                  }`}>
                  <div className="text-[#8144e9] p-2 bg-gray-100 rounded-full shadow-sm">{category.icon}</div>
                  <p className="text-sm text-center">{category.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expense panel */}
          <div className="w-1/2 flex-none">
            <div className="grid grid-cols-3 gap-3">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex flex-col items-center gap-2 p-1 hover:bg-[#fdf0ec] hover:rounded-lg hover:shadow-sm cursor-pointer ${
                    selectedCategory === category.id ? 'bg-[#fdf0ec] rounded-lg' : ''
                  }`}>
                  <div className="text-[#ee7048] p-2 bg-gray-100 rounded-full shadow-sm">{category.icon}</div>
                  <p className="text-sm text-center">{category.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
