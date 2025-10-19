import { ArrowDown, ArrowUp, ChevronDown, ChevronRight } from 'lucide-react';

export const BalanceCard = () => {
  return (
    <div className="flex flex-col w-[400px]  p-8 rounded-4xl balance-card text-white overflow-hidden min-h-[220px]">
      {/*top  */}
      <div className="flex justify-between items-start mb-10 w-full">
        <div className="flex flex-col w-full">
          <div className=" flex justify-between items-center w-full">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-sm font-semibold">Total Balance</h2>
              <ChevronDown />
            </div>
            <div className="flex items-center gap-1 mb-2  bg-white/5 dark:bg-white/5 backdrop-blur-md border border-white/20 shadow-sm rounded-full px-2 py-1 hover:bg-white/10 hover:scale-105 transition-all cursor-pointer"><h2 className="text-sm ">Cost overview</h2> <ChevronRight className='w-4 h-4'/> </div>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">$12,345.67</h2>
        </div>
      </div>
      {/* bottom */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 p-1 rounded-full flex items-center justify-center">
              <ArrowDown className="w-4 h-4" />
            </span>
            <p className="opacity-90">Income</p>
          </div>
          <h2 className="mt-2 font-semibold">$12,345.67</h2>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 p-1 rounded-full flex items-center justify-center">
              <ArrowUp className="w-4 h-4" />
            </span>
            <p className="opacity-90">Expenses</p>
          </div>
          <h2 className="mt-2 font-semibold">$12,345.67</h2>
        </div>
      </div>
    </div>
  );
};
