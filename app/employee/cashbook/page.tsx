import { Header } from "@/components/Header";
import { EmployeeSubNav } from "@/components/navigation/EmployeeSubNav";
import { Cashbook } from "@/components/finance/Cashbook";

export const dynamic = "force-dynamic";

export default function EmployeeCashbookPage() {
  return (
    <div>
      <Header title="Daily Cashbook Drawer & Shift Handover" subtitle="Open drawer session, collect counter cash bookings, and record shift closure balances" />
      <div className="page-container">
        <EmployeeSubNav />
        <Cashbook />
      </div>
    </div>
  );
}
