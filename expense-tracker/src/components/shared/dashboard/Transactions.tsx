'use client';

import { deleteTransactionAction, type TransactionFormState } from '@/app/(root)/dashboard/actions';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { Button } from '@/components/ui/button';
import { CURRENCY_META, type Currency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import { useActionState, useRef, useState } from 'react';
import { EditWindow, type TransactionEdit } from './addTransaction/EditWindow';
import type { CategoryOption } from './addTransaction/TransactionAdder';
import { LoadingOverlay } from './LoadingOverlay';
import { useWalletSwitch } from './WalletSwitchContext';

// Дата приходит уже отформатированной с сервера: если форматировать её здесь,
// серверный и клиентский рендер разойдутся из-за разных часовых поясов.
export type TransactionView = {
  id: string;
  categoryName: string;
  categoryId: string | null;
  iconName: string | null;
  /** null — курса нет, показываем исходную сумму как есть */
  amount: number | null;
  type: 'income' | 'expense';
  /** Исходная сумма, если операция введена в другой валюте */
  original: { amount: number; currency: string } | null;
  /** Как записано в базе — с этим работает форма правки */
  rawAmount: number;
  rawCurrency: Currency;
  /** Только время: дату несёт заголовок группы */
  timeLabel: string;
  comment: string | null;
  // Заполняется только для общего кошелька: в личном автор всегда один
  // и подпись была бы шумом.
  authorName: string | null;
  /** Владелец кошелька или автор записи. Остальным кнопки не показываем */
  canEdit: boolean;
};

/** День операций: «Сегодня», «Вчера» или дата. */
export type TransactionGroup = {
  key: string;
  label: string;
  items: TransactionView[];
};

interface Props {
  groups: TransactionGroup[];
  categories: CategoryOption[];
  className?: string;
  title?: string;
  currency: Currency;
}

const initialState: TransactionFormState = { error: null, ok: false };

// Ширина выезжающей панели: две кнопки по 64 px, зазор 8 px и отступ 12 px.
const ACTIONS_WIDTH = 148;

const format = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface RowProps {
  transaction: TransactionView;
  symbol: string;
  onEdit: (transaction: TransactionEdit) => void;
}

const Row: React.FC<RowProps> = ({ transaction, symbol, onEdit }) => {
  const [confirming, setConfirming] = useState(false);
  // Дорожка сдвинута — значит панель открыта. Ширину заголовка ограничиваем
  // только в этот момент: иначе дата обрезалась бы и в спокойном состоянии.
  const [swiped, setSwiped] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const [state, deleteForm, deleting] = useActionState(deleteTransactionAction, initialState);

  // Нажали кнопку — панель больше не нужна, возвращаем строку на место.
  const closePanel = () => track.current?.scrollTo({ left: 0, behavior: 'smooth' });

  const startEdit = () => {
    closePanel();
    onEdit({
      id: transaction.id,
      categoryId: transaction.categoryId,
      type: transaction.type,
      amount: transaction.rawAmount,
      currency: transaction.rawCurrency,
      comment: transaction.comment,
    });
  };

  const startDelete = () => {
    closePanel();
    setConfirming(true);
  };

  const amountText =
    transaction.amount === null
      ? `${format(transaction.original?.amount ?? 0)} ${transaction.original?.currency ?? ''}`
      : `${symbol}${format(transaction.amount)}`;

  return (
    <div className="group mt-4">
      {/* Телефон: строка — дорожка со снапом, вторая «страница» это кнопки.
          Тянем влево — открываются «Изменить» и «Удалить». На десктопе
          дорожка не нужна: там иконки появляются по наведению. */}
      <div
        ref={track}
        onScroll={(event) => setSwiped(event.currentTarget.scrollLeft > 4)}
        className={cn(
          'flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain',
          'md:snap-none md:overflow-x-visible',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        )}>
        <div className="flex w-full flex-none snap-start items-center justify-between">
          {/* sticky в горизонтальном скроллере: категория остаётся на месте,
              пока сумма уезжает под неё, — видно, к какой записи кнопки.
              Ширина ограничена шириной панели (ACTIONS_WIDTH): sticky не
              умеет выходить за свой контейнер и иначе прилипал бы криво,
              срезая иконку. */}
          <div
            className="sticky left-0 z-10 flex items-center gap-4 min-w-0 bg-white md:static"
            style={swiped ? { maxWidth: `calc(100% - ${ACTIONS_WIDTH}px)`, paddingRight: 12 } : undefined}>
            <div className="p-3 bg-gray-100 rounded-lg text-gray-600 shrink-0">
              <CategoryIcon name={transaction.iconName} />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="font-medium text-md truncate">{transaction.categoryName}</p>
              <p className="text-sm text-gray-400 truncate">
                {transaction.original && transaction.amount !== null
                  ? `${format(transaction.original.amount)} ${transaction.original.currency} · `
                  : ''}
                {transaction.authorName ? `${transaction.authorName} · ` : ''}
                {transaction.comment ? `${transaction.comment} · ` : ''}
                {transaction.timeLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <p
              className={cn(
                'font-semibold text-sm sm:text-md tabular-nums whitespace-nowrap',
                transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
              )}>
              {transaction.type === 'income' ? '+' : '−'}
              {amountText}
            </p>

            {/* Десктоп: место под иконки занято всегда, поэтому наведение
                ничего не сдвигает. focus-within — чтобы дойти табом. */}
            {transaction.canEdit ? (
              <div className="hidden md:flex items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Изменить операцию"
                  onClick={startEdit}
                  className="text-gray-400 hover:text-gray-900">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Удалить операцию"
                  onClick={startDelete}
                  className="text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Панель узкая нарочно: после сдвига категория и её иконка
            остаются на виду, и понятно, к какой записи кнопки. */}
        {transaction.canEdit ? (
          <div className="flex flex-none snap-end items-center gap-2 pl-3 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startEdit}
              className="h-14 w-16 flex-col gap-1 px-1 text-[11px]">
              <Pencil className="h-4 w-4" />
              Изменить
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={startDelete}
              className="h-14 w-16 flex-col gap-1 px-1 text-[11px]">
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>
          </div>
        ) : null}
      </div>

      {/* Удаление необратимо, поэтому спрашиваем явно — так же, как у кошельков. */}
      {confirming ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">
            Удалить операцию «{transaction.categoryName}» на {amountText}?
          </p>
          {state.error ? (
            <p role="alert" className="mt-1 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <form action={deleteForm}>
              <input type="hidden" name="transactionId" value={transaction.id} />
              <Button type="submit" variant="destructive" size="sm" disabled={deleting}>
                {deleting ? 'Удаляем…' : 'Удалить'}
              </Button>
            </form>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirming(false)}>
              Отмена
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const Transactions: React.FC<Props> = ({
  groups,
  categories,
  className,
  title,
  currency,
}) => {
  const symbol = CURRENCY_META[currency].symbol;
  const { isSwitching } = useWalletSwitch();
  const [editing, setEditing] = useState<TransactionEdit | null>(null);

  return (
    <LoadingOverlay
      active={isSwitching}
      label="Загружаем операции"
      className={cn('mt-10 sm:mt-16 w-full', className)}>
      <div>
        <div className="flex justify-between items-center mx-2 sm:mx-8">
          <h2 className="font-semibold text-2xl">{title}</h2>
        </div>

        {groups.length === 0 ? (
          <p className="mx-2 sm:mx-8 mt-6 text-gray-400">
            Пока пусто. Добавьте первую операцию кнопкой «плюс» справа.
          </p>
        ) : (
          // Список живёт в своей высоте и скроллится внутри: иначе месяц
          // операций растягивал бы страницу, и до всего, что ниже, пришлось
          // бы долго крутить.
          <div className="mx-2 sm:mx-8 mt-2 max-h-[22rem] overflow-y-auto overflow-x-hidden pr-1 sm:max-h-[28rem]">
            {groups.map((group) => (
              <div key={group.key}>
                {/* Заголовок дня липнет к верху блока: при долгой прокрутке
                    видно, к какой дате относятся строки под рукой. */}
                <h3 className="sticky top-0 z-20 bg-white pb-2 pt-3 text-sm font-semibold text-gray-400">
                  {group.label}
                </h3>
                {group.items.map((transaction) => (
                  <Row
                    key={transaction.id}
                    transaction={transaction}
                    symbol={symbol}
                    onEdit={setEditing}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* key — чтобы форма начиналась с полей выбранной операции, а не
          с полей предыдущей. */}
      {editing ? (
        <EditWindow
          key={editing.id}
          transaction={editing}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </LoadingOverlay>
  );
};
