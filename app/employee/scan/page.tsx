import { Header } from "@/components/Header";
import { EmployeeSubNav } from "@/components/navigation/EmployeeSubNav";
import { ShipmentScanner } from "@/components/operations/ShipmentScanner";

export const dynamic = "force-dynamic";

export default function EmployeeScanPage() {
  return (
    <div>
      <Header title="Station Barcode Scanner" subtitle="880Hz audio feedback scanner for inward/outward package processing" />
      <div className="page-container">
        <EmployeeSubNav />
        <ShipmentScanner />
      </div>
    </div>
  );
}
