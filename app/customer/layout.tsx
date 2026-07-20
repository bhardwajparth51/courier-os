import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "CUSTOMER") redirect("/login");

  return (
    <div className="app-shell">
      <Sidebar
        role="CUSTOMER"
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
