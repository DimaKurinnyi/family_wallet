import Link from 'next/link';
import { AddWindow } from './addTransaction/AddWindow';
import type { CategoryOption } from './addTransaction/TransactionAdder';
import { NAV_ITEMS } from './navItems';

interface Props {
  categories: CategoryOption[];
  walletId: string | null;
}

const [dashboard, wallets, profile, home] = NAV_ITEMS;

// Боковая панель только для десктопа: она выезжает по наведению,
// а на сенсорных экранах наведения нет. Там работает MobileNav.
export const SideBar: React.FC<Props> = ({ categories, walletId }) => {
  const renderLink = ({ href, label, icon: Icon }: (typeof NAV_ITEMS)[number]) => (
    <Link key={href} href={href} className="p-2 rounded-md hover:bg-[#e094c8]">
      <Icon />
      <p>{label}</p>
    </Link>
  );

  return (
    <div className="flex flex-col items-start gap-14 border border-white/10 bg-[rgba(20,88,224,0.44)] backdrop-blur-md rounded-l-2xl w-[160px] shadow-lg relative">
      <div className="flex flex-col gap-4 p-3 items-start *:w-full *:flex *:gap-2 *:align-baseline *:font-semibold *:text-lg pb-1">
        {[dashboard, profile].map(renderLink)}
      </div>

      <AddWindow
        categories={categories}
        walletId={walletId}
        triggerClassName="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
      />

      <div className="flex flex-col gap-4 p-3 items-start *:w-full *:flex *:gap-2 *:align-baseline *:font-semibold *:text-lg pt-1">
        {[wallets, home].map(renderLink)}
      </div>
    </div>
  );
};
