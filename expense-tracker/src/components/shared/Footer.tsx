import Image from 'next/image';
import { SelectType } from './SelectType';
import { Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <div className=" py-10">
      <div className="flex  items-center justify-around align-center gap-2 bg-white/5 dark:bg-white/55 backdrop-blur-md border border-white/20 shadow-sm rounded-2xl p-14 ">
        <div className="flex-1">
          <div className="grid grid-cols-6 gap-1">
            <div className=" flex flex-col items-start justify-between">
              <Image src="/assets/icon-expense-2.svg" alt="logo" width={35} height={35} />
              <div className=" flex items-center ">
                <Globe className='w-4 h-4' />
                <SelectType />
                </div>
              
            </div>
            <div className="flex flex-col items-start gap-2">
              <h4 className="text-white font-semibold mb-2">Product</h4>
              <p className="text-sm font-bold text-gray-300">Overview</p>
              <p className="text-sm text-gray-300">Features</p>
              <p className="text-sm text-gray-300">Pricing</p>
              <p className="text-sm text-gray-300">Releases</p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <h4 className="text-white font-semibold mb-2">Company</h4>
              <p className="text-sm text-gray-300">About</p>
              <p className="text-sm text-gray-300">Team</p>
              <p className="text-sm text-gray-300">Careers</p>
              <p className="text-sm text-gray-300">Press</p>
              <p className="text-sm text-gray-300">Blog</p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <h4 className="text-white font-semibold mb-2">Resources</h4>
              <p className="text-sm text-gray-300">Docs</p>
              <p className="text-sm text-gray-300">Guides</p>
              <p className="text-sm text-gray-300">API</p>
              <p className="text-sm text-gray-300">Community</p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <h4 className="text-white font-semibold mb-2">Legal</h4>
              <p className="text-sm text-gray-300">Terms</p>
              <p className="text-sm text-gray-300">Privacy</p>
              <p className="text-sm text-gray-300">Security</p>
              <p className="text-sm text-gray-300">SLA</p>
              <p className="text-sm text-gray-300">Docs</p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <h4 className="text-white font-semibold mb-2">Contact</h4>
              <p className="text-sm text-gray-300">Support</p>
              <p className="text-sm text-gray-300">Sales</p>
              <p className="text-sm text-gray-300">Partnerships</p>
              <p className="text-sm text-gray-300">Email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
