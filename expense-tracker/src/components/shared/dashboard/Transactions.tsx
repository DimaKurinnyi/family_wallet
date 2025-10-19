import { Button } from '@/components/ui/button';

export const Transactions = () => {
  return (
    <div className=" mt-20 w-[800px]">
      <div className=" flex justify-between items-center">
        <h2 className="font-semibold text-2xl">Transactions</h2>

        <Button variant="link" className="text-gray-400 text-md font-extralight">
          See All
        </Button>
      </div>
    </div>
  );
};
