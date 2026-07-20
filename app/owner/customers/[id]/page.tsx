import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { CustomerService } from "@/lib/services/customer.service";
import { CustomerProfile } from "@/components/crm/CustomerProfile";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [customer, ledgerData] = await Promise.all([
    prisma.customer.findUnique({
      where: { id },
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
    }),
    CustomerService.getCustomerLedger(id).catch(() => ({
      customer: {},
      totalDebit: 0,
      totalCredit: 0,
      outstandingBalance: 0,
      entries: [],
    })),
  ]);

  if (!customer) notFound();

  return (
    <div>
      <Header title={`Customer Profile: ${customer.user?.name || "Account"}`} subtitle="Salesforce-Lite CRM Profile & Financial Ledger" />
      <div className="page-container">
        <CustomerProfile
          customer={JSON.parse(JSON.stringify(customer))}
          ledgerData={JSON.parse(JSON.stringify(ledgerData))}
        />
      </div>
    </div>
  );
}
