import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface Props {
  className?: string;
}

export const LogOutButton: React.FC<Props> = (className) => {
  return (
    <Link href="/profile" className={cn('', className)}>
      <Button variant="outline" className="rounded-full">
        Log Out
        <LogOut className="mr-2 h-4 w-4 text-gray-500" />
      </Button>
    </Link>
  );
};
