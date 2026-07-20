import { Header } from "@/components/Header";
import { CreateShipmentWizard } from "@/components/shipments/CreateShipmentWizard";

export default function NewOwnerShipmentPage() {
  return (
    <div>
      <Header title="Create New Shipment" subtitle="Book a shipment, calculate rates, and generate shipping labels" />
      <div className="page-container">
        <CreateShipmentWizard role="OWNER" />
      </div>
    </div>
  );
}
