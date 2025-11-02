'use client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BanknoteArrowUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { Transactions } from '../Transactions';
import { TransactionAdder } from './TransactionAdder';
import { InputAmount } from './InputAmount';

export function AddWindow() {
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | ''>('');
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) setTransactionType('');
        setOpen(isOpen);
      }}>
      <SheetTrigger asChild>
        <div className="absolute top-1/2 -translate-y-1/2  -translate-x-1/2 p-1.5 bg-white rounded-full">
          <Button variant="outline" className="rounded-full bg-[#e094c8] shadow-md shadow-[#e094c8] !h-14 !w-14 hover:!bg-[#e094c8] hover:scale-110 transition-transform border-0">
            <Plus className="text-white h-10 w-10" />
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent className='px-3'>
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-center">Add Transaction</SheetTitle>
          {/* <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription> */}
        </SheetHeader>
        <div className="flex items-center justify-between   *:flex *:flex-col *:items-center *:gap-2 *:cursor-pointer *:hover:scale-105 *:transition-transform *:px-10 *:py-4 *:rounded-lg ">
          <div className={transactionType === 'income' ? 'bg-[#f2ecfd] border-2 border-[#8144e9] ' : 'bg-[#f2ecfd]'} onClick={() => setTransactionType('income')}>
            <BanknoteArrowUp className="h-8 w-8 text-[#8144e9]" />
            <p>Add income</p>
          </div>
          <div className={transactionType === 'expense' ? 'bg-[#fdf0ec] border-2 border-[#ee7048]' : 'bg-[#fdf0ec]'} onClick={() => setTransactionType('expense')}>
            <BanknoteArrowUp className="h-8 w-8 rotate-180  text-[#ee7048]" />
            <p>Add expense</p>
          </div>
        </div>
        {transactionType && <div className=""><TransactionAdder transactionType={transactionType} />
        <InputAmount transactionType={transactionType}/>
        </div>}
        
        {!transactionType && <Transactions title="Last Transaction" className="mt-10" />}
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
