import {
  Car,
  CircleDot,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Music,
  Plane,
  ShoppingCart,
  Star,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

// В базе Icon.name — это имя иконки lucide. Маппинг явный, а не динамический
// импорт: имён всего дюжина, зато в бандл не утаскивается вся библиотека
// и опечатка в базе не роняет страницу.
const ICONS: Record<string, LucideIcon> = {
  ShoppingCart,
  Utensils,
  Car,
  Home: House,
  HeartPulse,
  Gamepad2,
  Wallet,
  GraduationCap,
  Star,
  Gift,
  Plane,
  Music,
};

interface Props {
  name?: string | null;
  className?: string;
}

export const CategoryIcon: React.FC<Props> = ({ name, className }) => {
  const Icon = (name && ICONS[name]) || CircleDot;
  return <Icon className={className} />;
};
