import { Header } from "@/components/Header";
import { CustomerService } from "@/lib/services/customer.service";
import { CustomerAnalytics } from "@/components/crm/CustomerAnalytics";

export const dynamic = "force-dynamic";

export default async function CustomerAnalyticsPage() {
  const analytics = await CustomerService.getCustomerAnalytics();

  return (
    <div>
      <Header title="Customer Intelligence & CRM Analytics" subtitle="Executive Insights: Top Accounts, Retention Cohorts, and Dormant Account Alerts" />
      <div className="page-container">
        <CustomerAnalytics analytics={JSON.parse(JSON.stringify(analytics))} />
      </div>
    </div>
  );
}
