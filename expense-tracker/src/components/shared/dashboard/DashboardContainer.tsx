import React from "react";
import { MobileNav } from "./MobileNav";
import { SideBar } from "./SideBar";
import { WalletSwitchProvider } from "./WalletSwitchContext";
import type { CategoryOption } from "./addTransaction/TransactionAdder";

interface Props {
  children?: React.ReactNode;
  categories: CategoryOption[];
  walletId: string | null;
}

export const DashboardContainer: React.FC<Props> = ({
  children,
  categories,
  walletId,
}) => {
  return (
    <WalletSwitchProvider>
      <div
        className="min-h-screen w-full p-3 sm:p-6 md:p-10 flex items-start md:items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #6fb3ff 0%, #7e92ff 35%, #c06bff 65%, #e094c8 100%)",
        }}
      >
        {/* pb-28 на телефоне — чтобы нижняя панель не накрывала содержимое */}
        <div className="w-full md:w-[90vw] bg-white p-4 sm:p-6 md:p-10 pb-28 md:pb-10 rounded-2xl min-h-[90vh] shadow-lg overflow-hidden relative">
          <div className="h-full">{children}</div>

          {/* Десктоп: панель выезжает справа по наведению */}
          <div className="hidden md:block absolute -right-27 top-1/2 -translate-y-1/2 hover:right-0 transition-all duration-300">
            <SideBar categories={categories} walletId={walletId} />
          </div>
        </div>

        <MobileNav categories={categories} walletId={walletId} />
      </div>
    </WalletSwitchProvider>
  );
};
