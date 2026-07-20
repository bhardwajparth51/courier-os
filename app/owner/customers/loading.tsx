import { Header } from "@/components/Header";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Header title="Customer Directory & CRM" subtitle="Loading customer directory..." />
      <div className="page-container" style={{ paddingTop: 20 }}>
        <TableSkeleton />
      </div>
    </div>
  );
}
