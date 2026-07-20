import { Header } from "@/components/Header";
import { FinanceSubNav } from "@/components/navigation/FinanceSubNav";
import { CODDashboard } from "@/components/finance/CODDashboard";

export const dynamic = "force-dynamic";

export default function OwnerCODPage() {
  return (
    <div>
      <Header title="COD Settlement & Driver Reconciliation" subtitle="Audit cash on delivery collections, track aging status, and settle with DTDC central hub" />
      <div className="page-container">
        <FinanceSubNav />
        <CODDashboard />
      </div>
    </div>
  );
}
