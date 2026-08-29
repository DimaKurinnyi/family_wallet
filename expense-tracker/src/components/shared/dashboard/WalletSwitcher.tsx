'use client';

import { selectWalletAction } from '@/app/(root)/dashboard/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings2, User, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export type WalletOption = { id: string; name: string; type: 'personal' | 'shared' };

interface Props {
  wallets: WalletOption[];
  activeWalletId: string;
}

export const WalletSwitcher: React.FC<Props> = ({ wallets, activeWalletId }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (walletId: string) => {
    startTransition(async () => {
      await selectWalletAction(walletId);
      router.refresh();
    });
  };

  // Раньше при одном кошельке выводился просто текст, и переключатель было не
  // отличить от подписи. Теперь это всегда кнопка: даже с одним кошельком в
  // списке видно, куда идти за вторым.
  return (
    <Select value={activeWalletId} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger
        aria-label="Выбрать кошелёк"
        className="h-10 w-auto min-w-[170px] max-w-[240px] gap-2 rounded-full border-gray-200 bg-white px-3 shadow-sm">
        <Wallet className="h-4 w-4 shrink-0 text-[#8144e9]" />
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {wallets.map((wallet) => (
          <SelectItem key={wallet.id} value={wallet.id}>
            <span className="flex items-center gap-2">
              {wallet.type === 'shared' ? (
                <Users className="h-4 w-4 text-gray-400" />
              ) : (
                <User className="h-4 w-4 text-gray-400" />
              )}
              {wallet.name}
            </span>
          </SelectItem>
        ))}

        <SelectSeparator />

        <Link
          href="/wallets"
          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          <Settings2 className="h-4 w-4 text-gray-400" />
          {wallets.length > 1 ? 'Управление кошельками' : 'Создать общий кошелёк'}
        </Link>
      </SelectContent>
    </Select>
  );
};
