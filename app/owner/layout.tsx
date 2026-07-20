import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "OWNER") redirect("/login");

  return (
    <div className="app-shell">
      <Sidebar
        role="OWNER"
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
