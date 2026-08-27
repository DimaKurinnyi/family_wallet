import { BalanceCard } from './BalanceCard';

interface Props {
  balance: number;
  income: number;
  expense: number;
  walletName?: string;
}

export const DashboardContent: React.FC<Props> = ({ balance, income, expense, walletName }) => {
  return (
    <div className="mt-12">
      <BalanceCard balance={balance} income={income} expense={expense} walletName={walletName} />
    </div>
  );
};
