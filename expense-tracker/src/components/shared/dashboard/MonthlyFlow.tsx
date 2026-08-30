'use client';

import { FlowBars, type FlowPoint } from '@/components/shared/charts/FlowBars';
import type { Currency } from '@/lib/currency';
import { LoadingOverlay } from './LoadingOverlay';
import { useWalletSwitch } from './WalletSwitchContext';

export type MonthPoint = FlowPoint;

interface Props {
  months: MonthPoint[];
  className?: string;
  currency: Currency;
}

// Столбцы рисует общий FlowBars: та же пара «доход — расход» показывается
// и по неделям на странице расходов, и расходиться они не должны.
export const MonthlyFlow: React.FC<Props> = ({ months, className, currency }) => {
  const { isSwitching } = useWalletSwitch();

  return (
    <LoadingOverlay active={isSwitching} label="Обновляем график" className={className}>
      <FlowBars
        points={months}
        currency={currency}
        title="Доходы и расходы"
        hint="Выберите месяц"
        emptyText="Пока нет операций — здесь появятся столбцы по месяцам."
      />
    </LoadingOverlay>
  );
};
