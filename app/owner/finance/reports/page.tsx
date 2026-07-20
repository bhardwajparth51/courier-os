import { Header } from "@/components/Header";
import { FinanceSubNav } from "@/components/navigation/FinanceSubNav";
import { ProfitLoss } from "@/components/finance/ProfitLoss";
import { CashFlow } from "@/components/finance/CashFlow";

export const dynamic = "force-dynamic";

export default function OwnerReportsPage() {
  return (
    <div>
      <Header title="Franchise Financial Statements" subtitle="Generate dynamic Profit & Loss statements and monthly net Cash Flow reports" />
      <div className="page-container">
        <FinanceSubNav />
        <div className="bento-grid">
          <div style={{ gridColumn: "span 6" }}>
            <ProfitLoss />
          </div>
          <div style={{ gridColumn: "span 6" }}>
            <CashFlow />
          </div>
        </div>
      </div>
    </div>
  );
}
