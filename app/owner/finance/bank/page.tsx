import { Header } from "@/components/Header";
import { FinanceSubNav } from "@/components/navigation/FinanceSubNav";
import { BankDepositTable } from "@/components/finance/BankDepositTable";

export const dynamic = "force-dynamic";

export default function OwnerBankDepositsPage() {
  return (
    <div>
      <Header title="Bank Ledger & Cash Remittances" subtitle="Record physical cash bank deposits, verify slip receipts, and balance till drawers" />
      <div className="page-container">
        <FinanceSubNav />
        <BankDepositTable />
      </div>
    </div>
  );
}
