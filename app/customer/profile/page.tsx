import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { CustomerService } from "@/lib/services/customer.service";
import { CustomerProfile } from "@/components/crm/CustomerProfile";

export const dynamic = "force-dynamic";

export default async function CustomerSelfProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  const customer = await prisma.customer.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, email: true } },
      savedAddresses: true,
      customerNotes: { orderBy: { createdAt: "desc" } },
      communications: { orderBy: { createdAt: "desc" } },
      customerDocuments: { orderBy: { uploadedAt: "desc" } },
      customerTags: true,
      customerRoutes: true,
      shipments: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          awbNumber: true,
          createdAt: true,
          receiverName: true,
          receiverCity: true,
          weight: true,
          totalAmount: true,
          status: true,
          serviceType: true,
        },
      },
    },
  });

  if (!customer) {
    return (
      <div>
        <Header title="My Profile" subtitle="Account details & shipping preferences" />
        <div className="page-container card" style={{ padding: 32, textAlign: "center" }}>
          Please complete booking or contact support to initialize your customer account.
        </div>
      </div>
    );
  }

  const ledgerData = await CustomerService.getCustomerLedger(customer.id).catch(() => ({
    customer: {},
    totalDebit: 0,
    totalCredit: 0,
    outstandingBalance: 0,
    entries: [],
  }));

  return (
    <div>
      <Header title="My Account & Shipping Profile" subtitle="Manage saved addresses, preferences, and view account statements" />
      <div className="page-container">
        <CustomerProfile
          customer={JSON.parse(JSON.stringify(customer))}
          ledgerData={JSON.parse(JSON.stringify(ledgerData))}
        />
      </div>
    </div>
  );
}
