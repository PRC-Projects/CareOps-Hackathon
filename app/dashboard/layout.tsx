import DashboardShell from "@/components/layout/dashboard-shell";
import { getCurrentUserPermissions } from "@/lib/user-util"; // Import the helper

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const permissions = await getCurrentUserPermissions();
  return <DashboardShell userPermissions={permissions}>{children}</DashboardShell>;
}