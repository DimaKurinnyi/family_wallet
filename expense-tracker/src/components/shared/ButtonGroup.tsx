import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

interface Props {
  className?: string;
}

export const ButtonGroup: React.FC<Props> = ({ className }) => {
  return (
    <div className={`mt-6 flex flex-wrap justify-center gap-3 sm:gap-4 ${className ?? ''}`}>
      <Button asChild variant="link" size="lg" className="font-bold text-white">
        <Link href="/login">Войти</Link>
      </Button>
      <Button asChild variant="default" size="lg">
        <Link href="/register">Регистрация</Link>
      </Button>
    </div>
  );
};
