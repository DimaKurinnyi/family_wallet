import { DashboardContainer, DashboardContent, Header, Transactions } from '@/components/shared';

export default function Dashboard() {
  return (
    <DashboardContainer>
      <Header />
      <div className="flex justify-around items-start">
        <DashboardContent />
        <div className="">Schedule</div>
      </div>
      <Transactions className="w-[600px]" title="Transactions" />
    </DashboardContainer>
  );
}
