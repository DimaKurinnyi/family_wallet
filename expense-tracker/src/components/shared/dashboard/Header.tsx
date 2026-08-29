import type { Currency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import CurrencySwitcher from './CurrencySwitcher';
import { LogOutButton } from './LogUotButton';
import { WalletSwitcher, type WalletOption } from './WalletSwitcher';

interface Props {
  className?: string;
  userName?: string | null;
  wallets: WalletOption[];
  activeWalletId: string;
  currency: Currency;
}

export const Header: React.FC<Props> = ({ className, userName, wallets, activeWalletId, currency }) => {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', className)}>
      <Link href="/">
        <div className="flex items-center justify-start">
          <Image
            src="/assets/icon-expense-2.svg"
            alt=""
            width={30}
            height={30}
            className="inline-block mr-3"
          />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700">Expense Tracker</h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500">Ведите расходы вместе с семьёй</p>
      </Link>

      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <WalletSwitcher wallets={wallets} activeWalletId={activeWalletId} />
        <CurrencySwitcher currency={currency} />
        <p className="text-sm hidden sm:block">С возвращением, {userName ?? 'друг'}</p>
        <LogOutButton />
      </div>
    </div>
  );
};
