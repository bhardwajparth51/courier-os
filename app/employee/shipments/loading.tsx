import { Header } from "@/components/Header";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Header title="Employee Operations — Shipments" subtitle="Loading counter bookings..." />
      <div className="page-container" style={{ paddingTop: 20 }}>
        <TableSkeleton />
      </div>
    </div>
  );
}
