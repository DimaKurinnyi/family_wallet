import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface Props {
  userId: string;
  /** Метка времени последней смены: без неё браузер показывал бы старую */
  updatedAt: Date | null;
  name: string;
  className?: string;
  /** Размер буквы-заглушки: font-size в процентах считается от шрифта
      родителя, а не от размера кружка, поэтому задаём явно. */
  letterClassName?: string;
}

/**
 * Аватар пользователя. Без картинки — первая буква имени: это опознаётся
 * быстрее, чем одинаковый для всех силуэт.
 *
 * Обычный <img>, а не next/image: картинка отдаётся своим роутом и уже
 * уменьшена до 256 пикселей, оптимизировать нечего.
 */
export const Avatar: React.FC<Props> = ({
  userId,
  updatedAt,
  name,
  className,
  letterClassName = 'text-base',
}) => {
  const letter = name.trim().charAt(0).toUpperCase();

  return (
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f2ecfd] text-[#8144e9]',
        className
      )}>
      {updatedAt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/avatar/${userId}?v=${updatedAt.getTime()}`}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : letter ? (
        <span className={cn('font-semibold leading-none', letterClassName)}>{letter}</span>
      ) : (
        <User className="h-1/2 w-1/2" aria-hidden="true" />
      )}
    </span>
  );
};
