'use client';
import React, { useState } from 'react';
interface Props {
  transactionType?: 'income' | 'expense' | '';
}

export const InputAmount: React.FC<Props> = ({ transactionType }) => {
  const [rawValue, setRawValue] = useState<string>('');

  // formatted display with thousands separator (ru-RU)
  const formatted = rawValue ? new Intl.NumberFormat('ru-RU').format(Number(rawValue)) : '';

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // keep only digits
    const digits = e.target.value.replace(/\D/g, '');
    setRawValue(digits);
  };
  console.log(formatted);
  return (
    <div className={`mt-10 p-3 rounded-2xl ${transactionType === 'income' ? 'bg-[#f2ecfd]' : 'bg-[#fdf0ec]'}`}>
      <h2 className='text-xl font-bold'>Enter Amount:</h2>

      <div className="flex items-center justify-between   mt-4">
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-black ml-3.5 "></div>
        <div className="flex items-center">
          {transactionType === 'income' ? <span className="ml-2 text-2xl font-bold text-gray-500">+</span> : <span className="ml-2 font-bold text-2xl   text-gray-500">-</span>}
          <input
            id="amount"
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={formatted}
            onChange={onChange}
            className="w-30  text-2xl px-1 font-bold border-0 focus:outline-none focus-visible:ring-0 shadow-none appearance-none placeholder:text-muted-foreground"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};
