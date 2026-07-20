import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { AddressManager } from "@/components/crm/AddressManager";

export const dynamic = "force-dynamic";

export default async function CustomerAddressesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const customer = await prisma.customer.findUnique({
    where: { userId },
    include: { savedAddresses: true },
  });

  return (
    <div>
      <Header title="My Saved Addresses" subtitle="Manage Home, Office, Warehouse, and Factory pickup locations" />
      <div className="page-container">
        {customer ? (
          <AddressManager
            customerId={customer.id}
            initialAddresses={JSON.parse(JSON.stringify(customer.customerAddresses))}
          />
        ) : (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            Please book a shipment first to initialize your address book.
          </div>
        )}
      </div>
    </div>
  );
}
