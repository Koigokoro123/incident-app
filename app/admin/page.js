import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Dashboard from "./Dashboard";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <Dashboard email={session.email} />;
}