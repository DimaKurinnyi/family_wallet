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
}

export const Header: React.FC<Props> = ({ className, userName, wallets, activeWalletId }) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Link href="/">
        <div className="flex items-center justify-start">
          <Image
            src="/assets/icon-expense-2.svg"
            alt="logo"
            width={30}
            height={30}
            className="inline-block mr-3"
          />
          <h1 className="text-3xl font-bold text-gray-700">Expense Tracker</h1>
        </div>
        <p className="text-sm text-gray-500">Ведите расходы вместе с семьёй</p>
      </Link>

      <div className="flex items-center gap-4">
        <WalletSwitcher wallets={wallets} activeWalletId={activeWalletId} />
        <CurrencySwitcher />
        <p>С возвращением, {userName ?? 'друг'}</p>
        <LogOutButton />
      </div>
    </div>
  );
};
