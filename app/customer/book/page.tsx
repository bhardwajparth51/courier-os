import { Header } from "@/components/Header";
import { CreateShipmentWizard } from "@/components/shipments/CreateShipmentWizard";

export default function CustomerBookPage() {
  return (
    <div>
      <Header title="Book Courier Parcel" subtitle="Schedule doorstep pickup or branch drop-off with instant rate calculation" />
      <div className="page-container">
        <CreateShipmentWizard role="CUSTOMER" />
      </div>
    </div>
  );
}
