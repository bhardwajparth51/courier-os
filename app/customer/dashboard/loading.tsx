import { Header } from "@/components/Header";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Header title="Customer Portal" subtitle="Loading consignment activity..." />
      <div className="page-container">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
