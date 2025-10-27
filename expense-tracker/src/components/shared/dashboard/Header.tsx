import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import {LogOutButton} from './LogUotButton';
import CurrencySwitcher from './CurrencySwitcher';

interface Props{
    className?: string;
}

export const Header: React.FC<Props> = ( className) => {
  return (
    <div
    className={cn('flex items-center justify-between', className)}>
        {/* left side */}
        <Link href="/" className="">
        <div className="flex items-center justify-start">
           <Image src="/assets/icon-expense-2.svg" alt="logo" width={30} height={30} className="inline-block mr-3"/>
            <h1 className="text-3xl font-bold text-gray-700">Expense Tracker</h1>
            
        </div>
        <p className="text-sm text-gray-500">Manage your expenses effectively</p>
        </Link>
        {/* right side */}
        <div className="flex items-center gap-4">
          <CurrencySwitcher/>
            <p>Welcome back,User</p>
            <LogOutButton/>
        </div>

    </div>
  )
}
