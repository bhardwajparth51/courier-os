import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (!session) redirect("/login");

  const role = session.user?.role;
  if (role === "OWNER") redirect("/owner/dashboard");
  if (role === "EMPLOYEE") redirect("/employee/dashboard");
  if (role === "CUSTOMER") redirect("/customer/dashboard");

  redirect("/login");
}
