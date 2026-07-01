import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Normal employees land on their requisitions, not the Dashboard
  // (which is restricted to Admin / Approver / Inventory Manager).
  if (session?.user?.role === "USER") {
    redirect("/requisitions/my");
  }

  redirect("/dashboard");
}
