import { Header } from "@/components/Header";
import { FinanceSubNav } from "@/components/navigation/FinanceSubNav";
import { Cashbook } from "@/components/finance/Cashbook";

export const dynamic = "force-dynamic";

export default function OwnerCashbookPage() {
  return (
    <div>
      <Header title="Daily Cashbook Register & Counter Drawer" subtitle="Monitor walk-in counter collections, drawer handovers, and difference alerts" />
      <div className="page-container">
        <FinanceSubNav />
        <Cashbook />
      </div>
    </div>
  );
}
