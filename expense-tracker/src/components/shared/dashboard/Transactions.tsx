"use client";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { cn } from "@/lib/utils";
import { CURRENCY_META, type Currency } from "@/lib/currency";
import { LoadingOverlay } from "./LoadingOverlay";
import { useWalletSwitch } from "./WalletSwitchContext";

// Дата приходит уже отформатированной с сервера: если форматировать её здесь,
// серверный и клиентский рендер разойдутся из-за разных часовых поясов.
export type TransactionView = {
  id: string;
  categoryName: string;
  iconName: string | null;
  /** null — курса нет, показываем исходную сумму как есть */
  amount: number | null;
  type: "income" | "expense";
  /** Исходная сумма, если операция введена в другой валюте */
  original: { amount: number; currency: string } | null;
  dateLabel: string;
  comment: string | null;
  // Заполняется только для общего кошелька: в личном автор всегда один
  // и подпись была бы шумом.
  authorName: string | null;
};

interface Props {
  transactions: TransactionView[];
  className?: string;
  title?: string;
  currency: Currency;
}

const format = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const Transactions: React.FC<Props> = ({
  transactions,
  className,
  title,
  currency,
}) => {
  const symbol = CURRENCY_META[currency].symbol;
  const { isSwitching } = useWalletSwitch();

  return (
    <LoadingOverlay
      active={isSwitching}
      label="Загружаем операции"
      className={cn("mt-10 sm:mt-16 w-full", className)}
    >
      <div>
        <div className="flex justify-between items-center mx-2 sm:mx-8">
          <h2 className="font-semibold text-2xl">{title}</h2>
        </div>

        {transactions.length === 0 ? (
          <p className="mx-2 sm:mx-8 mt-6 text-gray-400">
            Пока пусто. Добавьте первую операцию кнопкой «плюс» справа.
          </p>
        ) : (
          <div className="mx-2 sm:mx-8">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center mt-6"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                    <CategoryIcon name={transaction.iconName} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-md">
                      {transaction.categoryName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {transaction.original && transaction.amount !== null
                        ? `${format(transaction.original.amount)} ${transaction.original.currency} · `
                        : ""}
                      {transaction.authorName
                        ? `${transaction.authorName} · `
                        : ""}
                      {transaction.comment ? `${transaction.comment} · ` : ""}
                      {transaction.dateLabel}
                    </p>
                  </div>
                </div>
                <p
                  className={cn(
                    "font-semibold text-sm sm:text-md tabular-nums whitespace-nowrap",
                    transaction.type === "income"
                      ? "text-green-500"
                      : "text-red-500",
                  )}
                >
                  {transaction.type === "income" ? "+" : "−"}
                  {transaction.amount === null
                    ? `${format(transaction.original?.amount ?? 0)} ${transaction.original?.currency ?? ""}`
                    : `${symbol}${format(transaction.amount)}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </LoadingOverlay>
  );
};
