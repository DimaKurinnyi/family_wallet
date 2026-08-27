'use client';

import { selectWalletAction } from '@/app/(root)/dashboard/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export type WalletOption = { id: string; name: string };

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

  // Один кошелёк — переключать нечего, показываем просто название.
  if (wallets.length < 2) {
    return <p className="text-sm text-gray-500">{wallets[0]?.name}</p>;
  }

  return (
    <Select value={activeWalletId} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {wallets.map((wallet) => (
          <SelectItem key={wallet.id} value={wallet.id}>
            {wallet.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
