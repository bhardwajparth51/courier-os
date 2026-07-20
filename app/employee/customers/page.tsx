import { Header } from "@/components/Header";
import { CustomerService } from "@/lib/services/customer.service";
import { CustomerDirectory } from "@/components/crm/CustomerDirectory";

export const dynamic = "force-dynamic";

export default async function EmployeeCustomersPage() {
  const customers = await CustomerService.getCustomerMasterList();

  return (
    <div>
      <Header title="Employee Customer Terminal" subtitle="Search accounts, view saved addresses, and manage customer notes" />
      <div className="page-container">
        <CustomerDirectory initialCustomers={JSON.parse(JSON.stringify(customers))} />
      </div>
    </div>
  );
}
