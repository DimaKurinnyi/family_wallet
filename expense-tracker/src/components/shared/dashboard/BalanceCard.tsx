'use client';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface Props {
  balance: number;
  income: number;
  expense: number;
  walletName?: string;
}

const format = (value: number) =>
  new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export const BalanceCard: React.FC<Props> = ({ balance, income, expense, walletName }) => {
  const { symbol } = useCurrencyStore();

  return (
    <div className="flex flex-col w-[400px] p-8 rounded-4xl balance-card text-white overflow-hidden min-h-[220px]">
      <div className="flex justify-between items-start mb-10 w-full">
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-sm font-semibold">Баланс</h2>
            </div>
            {walletName ? (
              <div className="text-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
                {walletName}
              </div>
            ) : null}
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">
            {symbol}
            {format(balance)}
          </h2>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 p-1 rounded-full flex items-center justify-center">
              <ArrowDown className="w-4 h-4" />
            </span>
            <p className="opacity-90">Доходы</p>
          </div>
          <h2 className="mt-2 font-semibold">
            {symbol}
            {format(income)}
          </h2>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 p-1 rounded-full flex items-center justify-center">
              <ArrowUp className="w-4 h-4" />
            </span>
            <p className="opacity-90">Расходы</p>
          </div>
          <h2 className="mt-2 font-semibold">
            {symbol}
            {format(expense)}
          </h2>
        </div>
      </div>
    </div>
  );
};
