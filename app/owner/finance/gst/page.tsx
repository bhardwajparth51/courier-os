import { Header } from "@/components/Header";
import { FinanceSubNav } from "@/components/navigation/FinanceSubNav";
import { GSTDashboard } from "@/components/finance/GSTDashboard";

export const dynamic = "force-dynamic";

export default function OwnerGSTPage() {
  return (
    <div>
      <Header title="GST Output Registers & Input Claims" subtitle="View output SGST/CGST tax logs and input claims register, and export GSTR files" />
      <div className="page-container">
        <FinanceSubNav />
        <GSTDashboard />
      </div>
    </div>
  );
}
