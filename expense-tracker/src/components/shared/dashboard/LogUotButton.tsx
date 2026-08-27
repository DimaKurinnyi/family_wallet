'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';

interface Props {
  className?: string;
}

export const LogOutButton: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isPending}
      className={cn('rounded-full', className)}>
      {isPending ? 'Выходим…' : 'Выйти'}
      <LogOut className="ml-2 h-4 w-4 text-gray-500" />
    </Button>
  );
};
