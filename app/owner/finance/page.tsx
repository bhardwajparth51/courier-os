import { Header } from "@/components/Header";
import { FinanceSubNav } from "@/components/navigation/FinanceSubNav";
import { FinanceDashboard } from "@/components/finance/FinanceDashboard";

export const dynamic = "force-dynamic";

export default function OwnerFinancePage() {
  return (
    <div>
      <Header title="Franchise Finance & Accounting Hub" subtitle="Executive KPI dashboards, real-time counter cashier books, and revenue analytics" />
      <div className="page-container">
        <FinanceSubNav />
        <FinanceDashboard />
      </div>
    </div>
  );
}
