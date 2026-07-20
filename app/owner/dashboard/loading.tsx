import { Header } from "@/components/Header";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Header title="Franchise Control Tower" subtitle="Loading revenue analytics & KPIs..." />
      <div className="page-container">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
