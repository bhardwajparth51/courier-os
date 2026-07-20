import { Header } from "@/components/Header";
import { CustomerService } from "@/lib/services/customer.service";
import { CustomerDirectory } from "@/components/crm/CustomerDirectory";

export const dynamic = "force-dynamic";

export default async function OwnerCustomersPage() {
  const customers = await CustomerService.getCustomerMasterList();

  return (
    <div>
      <Header title="Customer Directory & CRM" subtitle="Master database for retail, business, and corporate accounts" />
      <div className="page-container">
        <CustomerDirectory initialCustomers={JSON.parse(JSON.stringify(customers))} />
      </div>
    </div>
  );
}
