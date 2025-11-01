import { Home, LayoutDashboard, User, Wallet } from 'lucide-react';
import Link from 'next/link';
import { AddTransaction } from './addTransaction/AddTransaction';

export const SideBar = () => {
  return (
    <div className="flex flex-col items-start gap-14  border border-white/10 bg-[rgba(20,88,224,0.44)] backdrop-blur-md rounded-l-2xl w-[160px] shadow-lg  relative">
      <div className="flex flex-col gap-4 p-3 items-start  *:w-full *:flex *:gap-2 *:align-baseline *:font-semibold *:text-lg pb-1">
        <Link href="/profile" className="p-2 rounded-md hover:bg-[#e094c8]">
          <User />
          <p>Profile</p>
        </Link>

        <Link href="/dashboard" className="p-2 rounded-md hover:bg-[#e094c8]">
          <LayoutDashboard />
          <p>Dashboard</p>
        </Link>
      </div>

      <AddTransaction />
      <div className="flex flex-col gap-4 p-3 items-start *:w-full *:flex *:gap-2 *:align-baseline *:font-semibold *:text-lg pt-1">
        <Link href="/wallets" className="p-2  rounded-md hover:bg-[#e094c8]">
          <Wallet />
          <p>Wallet</p>
        </Link>

        <Link href="/" className="p-2 rounded-md hover:bg-[#e094c8] ">
          <Home />
          <p>Home</p>
        </Link>
      </div>
    </div>
  );
};
