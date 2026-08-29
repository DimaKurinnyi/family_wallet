import { CreateWalletForm } from '@/components/shared/wallets/CreateWalletForm';
import { WalletCard, type WalletView } from '@/components/shared/wallets/WalletCard';
import { DashboardContainer, Header } from '@/components/shared';
import { resolveActiveWallet } from '@/server/activeWallet';
import { getDisplayCurrency } from '@/server/displayCurrency';
import { getCategoriesForUser } from '@/server/dashboard.service';
import { getCurrentUser } from '@/server/session';
import { getUserWallets, getWalletWithPeople } from '@/server/wallet.service';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Кошельки — Expense Tracker' };

export default async function WalletsPage() {
  const user = await getCurrentUser();

  const [wallets, categories, currency] = await Promise.all([
    getUserWallets(user.id),
    getCategoriesForUser(user.id),
    getDisplayCurrency(),
  ]);

  const activeWallet = await resolveActiveWallet(wallets);

  const detailed = await Promise.all(
    wallets.map((wallet) => getWalletWithPeople(user.id, wallet.id))
  );

  const views: WalletView[] = detailed.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    type: wallet.type,
    isOwner: wallet.ownerId === user.id,
    owner: wallet.owner,
    members: wallet.members.map((member) => member.user),
    invites: wallet.invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      token: invite.token,
    })),
  }));

  return (
    <DashboardContainer
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        iconName: category.icon?.name ?? null,
        flow: category.flow,
      }))}
      walletId={activeWallet?.id ?? null}
      currency={currency}>
      <Header
        userName={user.name ?? user.email}
        wallets={wallets.map((wallet) => ({ id: wallet.id, name: wallet.name, type: wallet.type }))}
        activeWalletId={activeWallet?.id ?? ''}
        currency={currency}
      />

      <div className="mt-8 flex flex-col gap-4 max-w-[640px] mx-auto">
        <h2 className="text-2xl font-semibold">Кошельки</h2>
        {views.map((wallet) => (
          <WalletCard key={wallet.id} wallet={wallet} currentUserId={user.id} />
        ))}
        <CreateWalletForm />
      </div>
    </DashboardContainer>
  );
}
