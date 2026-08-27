import { Home, LayoutDashboard, User, Wallet, type LucideIcon } from 'lucide-react';

export type NavItem = { href: string; label: string; icon: LucideIcon };

// Один список на обе навигации: боковую на десктопе и нижнюю на телефоне.
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/wallets', label: 'Кошельки', icon: Wallet },
  { href: '/profile', label: 'Профиль', icon: User },
  { href: '/', label: 'Главная', icon: Home },
];
