import { Button } from '@/components/ui/button';
import { Home, LayoutDashboard, Plus, User, Wallet } from 'lucide-react';
import Link from 'next/link';

export const SideBar = () => {
  return (
    <div className="flex flex-col items-center gap-14 p-4 border border-white/10 bg-[rgba(20,88,224,0.44)] backdrop-blur-md rounded-l-2xl shadow-lg w-16 relative">
      <div className="flex flex-col gap-4">
        <Link href="/profile" className="p-2 rounded-md hover:bg-[#e094c8]">
          <User />
        </Link>

        <Link href="/dashboard" className="p-2 rounded-md hover:bg-[#e094c8]">
          <LayoutDashboard />
        </Link>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2  -translate-x-1/2 p-1.5 bg-white rounded-full">
        <Button variant="outline" className="rounded-full bg-[#e094c8] shadow-md shadow-[#e094c8] !h-14 !w-14 hover:!bg-[#e094c8] hover:scale-110 transition-transform border-0">
          <Plus className="text-white h-10 w-10" />
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <Link href="/wallets" className="p-2 rounded-md hover:bg-[#e094c8]">
          <Wallet />
        </Link>

        <Link href="/" className="p-2 rounded-md hover:bg-[#e094c8]">
          <Home />
        </Link>
      </div>
    </div>
  );
};
