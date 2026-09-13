import { DashboardContainer, Header } from '@/components/shared';
import CurrencySwitcher from '@/components/shared/dashboard/CurrencySwitcher';
import { LogOutButton } from '@/components/shared/dashboard/LogUotButton';
import { Avatar } from '@/components/shared/profile/Avatar';
import { resolveActiveWallet } from '@/server/activeWallet';
import { getCategoriesForUser } from '@/server/dashboard.service';
import { getDisplayCurrency } from '@/server/displayCurrency';
import { getCurrentUser } from '@/server/session';
import { getUserWallets } from '@/server/wallet.service';
import { ChevronRight, Wallet } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Больше — Expense Tracker' };

export default async function MorePage() {
  const user = await getCurrentUser();

  const [wallets, categories, currency] = await Promise.all([
    getUserWallets(user.id),
    getCategoriesForUser(user.id),
    getDisplayCurrency(),
  ]);
  const activeWallet = await resolveActiveWallet(wallets);

  const displayName = user.name?.trim() || user.email;

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
        userName={displayName}
        wallets={wallets.map((wallet) => ({ id: wallet.id, name: wallet.name, type: wallet.type }))}
        activeWalletId={activeWallet?.id ?? ''}
      />

      <div className="mx-auto mt-6 flex w-full max-w-[560px] flex-col gap-4">
        <Link
          href="/profile"
          className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50">
          <Avatar
            userId={user.id}
            updatedAt={user.avatarUpdatedAt}
            name={displayName}
            className="h-12 w-12"
            letterClassName="text-xl"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{displayName}</span>
            <span className="block truncate text-sm text-gray-400">{user.email}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
        </Link>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-medium text-gray-800">Валюта показа</h2>
              {/* Валюта только для показа: операции хранятся в той, в которой
                  их внесли, и пересчитываются при выводе. */}
              <p className="text-sm text-gray-400">
                Суммы пересчитываются в неё по текущему курсу
              </p>
            </div>
            <CurrencySwitcher currency={currency} />
          </div>
        </section>

        <Link
          href="/wallets"
          className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50">
          <Wallet className="h-5 w-5 shrink-0 text-gray-400" />
          <span className="min-w-0 flex-1">
            <span className="block font-medium">Кошельки</span>
            <span className="block text-sm text-gray-400">
              {wallets.length === 1 ? '1 кошелёк' : `${wallets.length} кошелька и участники`}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
        </Link>

        <LogOutButton className="w-full justify-center" />
      </div>
    </DashboardContainer>
  );
}
