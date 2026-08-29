'use client';

import { selectWalletAction } from '@/app/(root)/dashboard/actions';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, useTransition } from 'react';
import { BalanceCard } from './BalanceCard';

export type WalletSummary = {
  id: string;
  name: string;
  type: 'personal' | 'shared';
  balance: number;
  income: number;
  expense: number;
};

interface Props {
  wallets: WalletSummary[];
  activeWalletId: string;
}

// Карусель кошельков для телефона: листается свайпом, как карты в банковском
// приложении. На десктопе не показывается — там есть переключатель в шапке,
// а мышью такое листать неудобно.
export const BalanceCarousel: React.FC<Props> = ({ wallets, activeWalletId }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const activeIndex = Math.max(
    0,
    wallets.findIndex((wallet) => wallet.id === activeWalletId)
  );
  const [visibleIndex, setVisibleIndex] = useState(activeIndex);

  // Программная прокрутка к активному кошельку не должна считаться свайпом.
  const settledIndex = useRef(activeIndex);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    settledIndex.current = activeIndex;
    setVisibleIndex(activeIndex);
    scroller.scrollTo({ left: activeIndex * scroller.clientWidth, behavior: 'auto' });
  }, [activeIndex]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let timer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      clearTimeout(timer);
      // Ждём, пока свайп остановится: иначе кошелёк менялся бы по пути.
      timer = setTimeout(() => {
        const width = scroller.clientWidth;
        if (!width) return;
        const index = Math.round(scroller.scrollLeft / width);
        setVisibleIndex(index);

        if (index === settledIndex.current) return;
        const wallet = wallets[index];
        if (!wallet) return;

        settledIndex.current = index;
        startTransition(async () => {
          await selectWalletAction(wallet.id);
          router.refresh();
        });
      }, 120);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      scroller.removeEventListener('scroll', onScroll);
    };
  }, [wallets, router]);

  if (wallets.length === 0) return null;

  return (
    <div className="md:hidden">
      <div
        ref={scrollerRef}
        // Отрицательные поля гасят внутренние отступы: они нужны только для
        // того, чтобы тень карточки помещалась внутри области прокрутки.
        // Контейнер прокрутки режет по обеим осям — overflow-y сам становится
        // auto, стоит задать overflow-x, — и без запаса тень обрубалась по
        // прямой линии снизу и справа.
        className="-mx-3 -my-8 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Кошельки, листайте вбок">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="w-full shrink-0 snap-center px-3 py-8">
            <BalanceCard
              balance={wallet.balance}
              income={wallet.income}
              expense={wallet.expense}
              walletName={wallet.name}
              walletType={wallet.type}
            />
          </div>
        ))}
      </div>

      {wallets.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
          {wallets.map((wallet, index) => (
            <span
              key={wallet.id}
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === visibleIndex ? 'w-5 bg-gray-700' : 'w-1.5 bg-gray-300'
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
