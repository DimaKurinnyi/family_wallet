import Link from 'next/link';
import { AddWindow } from './addTransaction/AddWindow';
import type { CategoryOption } from './addTransaction/TransactionAdder';
import { NAV_ITEMS } from './navItems';

interface Props {
  categories: CategoryOption[];
  walletId: string | null;
}

const [dashboard, wallets, profile, home] = NAV_ITEMS;

// Нижняя панель для телефона: боковая выезжает по наведению, которого
// на сенсорном экране не бывает.
export const MobileNav: React.FC<Props> = ({ categories, walletId }) => {
  const renderLink = ({ href, label, icon: Icon }: (typeof NAV_ITEMS)[number]) => (
    <Link
      key={href}
      href={href}
      className="flex flex-1 flex-col items-center gap-1 py-1 text-white text-[11px] font-medium">
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/20 bg-[rgba(20,88,224,0.92)] backdrop-blur-md">
      <div className="flex items-end justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {[dashboard, wallets].map(renderLink)}
        <AddWindow categories={categories} walletId={walletId} triggerClassName="-mt-8 shrink-0" />
        {[profile, home].map(renderLink)}
      </div>
    </nav>
  );
};
