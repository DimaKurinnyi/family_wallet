import { ChartPie, Ellipsis, LayoutDashboard, Wallet, type LucideIcon } from 'lucide-react';

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Один список на обе навигации: боковую на десктопе и нижнюю на телефоне.
// Порядок общий: на десктопе первые два уходят в верхнюю группу, последние
// два — в нижнюю; на телефоне они расходятся по сторонам от кнопки «плюс».
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/expenses', label: 'Расходы', icon: ChartPie },
  { href: '/wallets', label: 'Кошельки', icon: Wallet },
  { href: '/more', label: 'Больше', icon: Ellipsis },
];
