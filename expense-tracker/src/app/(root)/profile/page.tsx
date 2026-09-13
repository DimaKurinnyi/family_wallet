import { DashboardContainer, Header } from '@/components/shared';
import { AvatarPicker } from '@/components/shared/profile/AvatarPicker';
import { NameForm, PasswordForm } from '@/components/shared/profile/ProfileForms';
import { resolveActiveWallet } from '@/server/activeWallet';
import { getCategoriesForUser } from '@/server/dashboard.service';
import { getDisplayCurrency } from '@/server/displayCurrency';
import { getCurrentUser } from '@/server/session';
import { getUserWallets } from '@/server/wallet.service';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = { title: 'Профиль — Expense Tracker' };

export default async function ProfilePage() {
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
          href="/more"
          className="flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ChevronLeft className="h-4 w-4" />
          Больше
        </Link>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800">Профиль</h2>
          <div className="mt-4">
            <AvatarPicker
              userId={user.id}
              name={displayName}
              updatedAt={user.avatarUpdatedAt}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <NameForm name={user.name ?? ''} />

          <div className="mt-5">
            <p className="text-sm text-gray-500">Почта</p>
            <p className="mt-1 font-medium break-all">{user.email}</p>
            {/* Прямо говорим, почему поле не редактируется: иначе это
                выглядит как недоделка. */}
            <p className="mt-1 text-xs text-gray-400">
              Почту сменить нельзя: по ней вы входите и на неё приходят приглашения в кошельки.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800">Пароль</h2>
          <div className="mt-4">
            <PasswordForm />
          </div>
        </section>
      </div>
    </DashboardContainer>
  );
}
