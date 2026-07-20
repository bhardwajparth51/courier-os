import { Header } from "@/components/Header";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Header title="Employee Operations Hub" subtitle="Loading dashboard metrics..." />
      <div className="page-container">
        <DashboardSkeleton />
      </div>
    </div>
  );
}
