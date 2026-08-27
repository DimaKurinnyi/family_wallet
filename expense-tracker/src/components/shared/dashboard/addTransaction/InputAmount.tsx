'use client';

interface Props {
  transactionType: 'income' | 'expense';
  value: string;
  onChange: (digits: string) => void;
}

export const InputAmount: React.FC<Props> = ({ transactionType, value, onChange }) => {
  const formatted = value ? new Intl.NumberFormat('ru-RU').format(Number(value)) : '';

  return (
    <div
      className={`mt-8 p-3 rounded-2xl ${
        transactionType === 'income' ? 'bg-[#f2ecfd]' : 'bg-[#fdf0ec]'
      }`}>
      <h2 className="text-xl font-bold">Сумма:</h2>

      <div className="flex items-center justify-center mt-4">
        <span className="text-2xl font-bold text-gray-500">
          {transactionType === 'income' ? '+' : '−'}
        </span>
        <input
          id="amount-display"
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
          className="w-40 text-2xl px-1 font-bold bg-transparent border-0 focus:outline-none"
          placeholder="0"
          aria-label="Сумма"
        />
      </div>
    </div>
  );
};
