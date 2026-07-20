import { Header } from "@/components/Header";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Header title="All Shipments & Consignments" subtitle="Loading master consignment ledger..." />
      <div className="page-container" style={{ paddingTop: 20 }}>
        <TableSkeleton />
      </div>
    </div>
  );
}
