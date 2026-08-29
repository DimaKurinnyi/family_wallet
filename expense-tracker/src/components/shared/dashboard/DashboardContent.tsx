import { BalanceCarousel, type WalletSummary } from './BalanceCarousel';
import { BalanceCard } from './BalanceCard';

interface Props {
  wallets: WalletSummary[];
  activeWalletId: string;
}

export const DashboardContent: React.FC<Props> = ({ wallets, activeWalletId }) => {
  const active = wallets.find((wallet) => wallet.id === activeWalletId) ?? wallets[0];

  return (
    <div className="mt-8 sm:mt-12 w-full max-w-[460px]">
      {/* Телефон — карусель со свайпом, десктоп — одна активная карточка:
          листать мышью неудобно, а переключатель в шапке есть на обоих. */}
      <BalanceCarousel wallets={wallets} activeWalletId={activeWalletId} />

      {active ? (
        <div className="hidden md:block">
          <BalanceCard
            balance={active.balance}
            income={active.income}
            expense={active.expense}
            walletName={active.name}
            walletType={active.type}
          />
        </div>
      ) : null}
    </div>
  );
};
