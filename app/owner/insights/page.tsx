import { Header } from "@/components/Header";
import { ManagementSubNav } from "@/components/navigation/ManagementSubNav";
import { Lightbulb, TrendingUp, AlertTriangle, HelpCircle } from "lucide-react";

export default function OwnerInsightsPage() {
  const insights = [
    {
      title: "RTO Risk Reduction Opportunity",
      desc: "Business customer 'Anita Mehta' has a 12% return-to-origin (RTO) rate on COD shipments. Suggest switching to digital UPI payment collection to reduce delivery failures.",
      impact: "Saves ~₹2,400/month in freight",
      type: "OPTIMIZATION",
      color: "var(--brand-red)",
    },
    {
      title: "Preferred Courier Route Shift",
      desc: "65% of your express package volume targets Pune-Mumbai. Consolidate shipments into Bag-Mumbai direct sealed containers to bypass secondary sorting hubs.",
      impact: "Reduces transit time by 8 hours",
      type: "EFFICIENCY",
      color: "#2563EB",
    },
    {
      title: "Bulk Corporate Tariff Optimization",
      desc: "Parth Enterprises is approaching 100+ AWBs this month. Offering a custom bulk discount agreement (e.g. ₹5/kg off) will lock in long-term exclusivity.",
      impact: "Ensures customer retention",
      type: "CRM_INTELLIGENCE",
      color: "#16A34A",
    },
  ];

  return (
    <div>
      <Header title="AI Franchise Insights & Advisor" subtitle="Autonomous intelligence recommending logistics routing, risk mitigations, and tariff adjustments" />
      <div className="page-container">
        <ManagementSubNav />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {insights.map((insight, idx) => (
            <div key={idx} className="card" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Lightbulb size={20} color={insight.color} />
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>{insight.title}</h3>
                </div>
                <span className="badge badge-blue" style={{ fontSize: 11 }}>{insight.type}</span>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
                {insight.desc}
              </p>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: insight.color }}>
                💡 Estimated Impact: {insight.impact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
