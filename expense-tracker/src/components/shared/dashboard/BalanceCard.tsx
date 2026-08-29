'use client';
import { CURRENCY_META, type Currency } from '@/lib/currency';
import { ArrowDown, ArrowUp, User, Users } from 'lucide-react';

interface Props {
  /** null — курсов нет, свести валюты в одно число нечем */
  balance: number | null;
  income: number | null;
  expense: number | null;
  walletName?: string;
  walletType?: 'personal' | 'shared';
  currency: Currency;
}

const format = (value: number | null) =>
  value === null
    ? '—'
    : new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export const BalanceCard: React.FC<Props> = ({ balance, income, expense, walletName, walletType, currency }) => {
  const symbol = CURRENCY_META[currency].symbol;

  return (
    // Пропорции банковской карты — 85.6×54 мм. Высота считается от ширины,
    // поэтому карточка остаётся вытянутой на любом экране, а не квадратной.
    <div className="flex flex-col justify-between w-full max-w-[460px] aspect-[85.6/54] p-5 sm:p-7 rounded-3xl balance-card text-white overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold opacity-90">Баланс</h2>
        {walletName ? (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 max-w-[60%]">
            {walletType === 'shared' ? (
              <Users className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <User className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate">{walletName}</span>
          </div>
        ) : null}
      </div>

      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums break-all">
        {balance === null ? '' : symbol}
        {format(balance)}
      </h2>

      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 p-1 rounded-full flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5" />
            </span>
            <p className="opacity-90 text-sm">Доходы</p>
          </div>
          <h2 className="mt-1 font-semibold tabular-nums truncate">
            {income === null ? '' : symbol}
            {format(income)}
          </h2>
        </div>
        <div className="flex flex-col items-end min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 p-1 rounded-full flex items-center justify-center">
              <ArrowUp className="w-3.5 h-3.5" />
            </span>
            <p className="opacity-90 text-sm">Расходы</p>
          </div>
          <h2 className="mt-1 font-semibold tabular-nums truncate">
            {expense === null ? '' : symbol}
            {format(expense)}
          </h2>
        </div>
      </div>
    </div>
  );
};
