'use client';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { CalendarRange } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type PeriodMode = 'month' | 'year';

const LABELS: Record<PeriodMode, string> = {
  month: 'По месяцам',
  year: 'По годам',
};

interface Props {
  mode: PeriodMode;
  /** Готовые адреса на каждый режим: строит их страница, она знает про месяц,
      год и участника, и терять их при переключении нельзя. */
  hrefs: Record<PeriodMode, string>;
}

// Режим живёт в адресе, как месяц и участник, поэтому переключатель просто
// переходит по ссылке — состояние на клиенте держать не нужно.
export const PeriodSelect: React.FC<Props> = ({ mode, hrefs }) => {
  const router = useRouter();

  return (
    <Select value={mode} onValueChange={(next) => router.push(hrefs[next as PeriodMode])}>
      <SelectTrigger
        aria-label="Период"
        // w-fit, а не w-auto: триггер — блочный элемент в колонке и иначе
        // растягивается во всю ширину, будто это поле ввода.
        className="h-9 w-fit gap-2 rounded-full border-gray-200 bg-white px-3 shadow-sm">
        <CalendarRange className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium">{LABELS[mode]}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="month">{LABELS.month}</SelectItem>
        <SelectItem value="year">{LABELS.year}</SelectItem>
      </SelectContent>
    </Select>
  );
};
