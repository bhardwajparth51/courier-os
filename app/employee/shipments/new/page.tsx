import { Header } from "@/components/Header";
import { EmployeeSubNav } from "@/components/navigation/EmployeeSubNav";
import { CreateShipmentWizard } from "@/components/shipments/CreateShipmentWizard";

export default function NewEmployeeShipmentPage() {
  return (
    <div>
      <Header title="Counter Booking Wizard" subtitle="Fast counter booking, rate calculation, and label printing" />
      <div className="page-container">
        <EmployeeSubNav />
        <CreateShipmentWizard role="EMPLOYEE" />
      </div>
    </div>
  );
}
