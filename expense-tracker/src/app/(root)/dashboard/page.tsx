import { DashboardContainer, DashboardContent, Header, Transactions } from '@/components/shared';
import type { TransactionView } from '@/components/shared/dashboard/Transactions';
import { resolveActiveWallet } from '@/server/activeWallet';
import {
  getCategoriesForUser,
  getWalletSummaries,
  getWalletTransactions,
} from '@/server/dashboard.service';
import { getCurrentUser } from '@/server/session';
import { getUserWallets } from '@/server/wallet.service';

// Дату форматируем здесь, а не в клиентском компоненте: иначе серверный и
// клиентский рендер разойдутся из-за разных часовых поясов.
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export default async function Dashboard() {
  const user = await getCurrentUser();

  const [wallets, categories] = await Promise.all([
    getUserWallets(user.id),
    getCategoriesForUser(user.id),
  ]);

  const activeWallet = await resolveActiveWallet(wallets);

  const [summaries, transactions] = await Promise.all([
    getWalletSummaries(wallets.map((wallet) => wallet.id)),
    activeWallet ? getWalletTransactions(activeWallet.id) : [],
  ]);

  const walletSummaries = wallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    type: wallet.type,
    ...(summaries.get(wallet.id) ?? { income: 0, expense: 0, balance: 0 }),
  }));

  const isShared = activeWallet?.type === 'shared';

  const transactionViews: TransactionView[] = transactions.map((transaction) => ({
    id: transaction.id,
    categoryName: transaction.category?.name ?? 'Без категории',
    iconName: transaction.category?.icon?.name ?? null,
    amount: transaction.amount,
    type: transaction.type,
    dateLabel: dateFormatter.format(transaction.createdAt),
    comment: transaction.comment,
    authorName: isShared ? transaction.user.name?.trim() || transaction.user.email : null,
  }));

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
    iconName: category.icon?.name ?? null,
    flow: category.flow,
  }));

  return (
    <DashboardContainer categories={categoryOptions} walletId={activeWallet?.id ?? null}>
      <Header
        userName={user.name ?? user.email}
        wallets={wallets.map((wallet) => ({ id: wallet.id, name: wallet.name, type: wallet.type }))}
        activeWalletId={activeWallet?.id ?? ''}
      />
      <div className="flex flex-col md:flex-row md:justify-around items-center md:items-start">
        <DashboardContent wallets={walletSummaries} activeWalletId={activeWallet?.id ?? ''} />
      </div>
      <Transactions className="max-w-[600px]" title="Операции" transactions={transactionViews} />
    </DashboardContainer>
  );
}
