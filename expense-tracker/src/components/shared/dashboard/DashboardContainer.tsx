import React from 'react'
import { SideBar } from './SideBar';
 
export const DashboardContainer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full p-10 flex items-center justify-center"
      style={{
        minHeight: '100vh',
        background:
          "linear-gradient(135deg, #6fb3ff 0%, #7e92ff 35%, #c06bff 65%, #e094c8 100%)",
      }}>
      <div className="w-[90vw] bg-white p-10   rounded-2xl min-h-[90vh] shadow-lg overflow-hidden relative">
        {/* Контент страницы */}
        <div className="h-full">
          {children}
        </div>

        {/* SideBar — прижат к внутренней правой части белого блока и центрирован по вертикали */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <SideBar />
        </div>
      </div>
    </div>
  );
};
