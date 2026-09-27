import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { demo } from "@/lib/supabase";
import { AdminShell } from "@/components/admin-shell";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Content studio",
  robots: { index: false, follow: false },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdmin();
  if (!user && !demo) redirect("/admin/login");
  return (
    <AdminShell demo={demo} email={user?.email || ""}>
      {children}
    </AdminShell>
  );
}
