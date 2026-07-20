import { Header } from "@/components/Header";
import { ShipmentScanner } from "@/components/operations/ShipmentScanner";

export const dynamic = "force-dynamic";

export default function OwnerScanPage() {
  return (
    <div>
      <Header title="Station Barcode Scanner" subtitle="880Hz audio feedback scanner for inward/outward package processing" />
      <div className="page-container">
        <ShipmentScanner />
      </div>
    </div>
  );
}
