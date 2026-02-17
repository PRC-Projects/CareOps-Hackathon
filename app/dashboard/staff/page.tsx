import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StaffInviteForm from "./invite-form";
import { RoleSelect } from "@/components/dashboard/role-select"; // <--- IMPORT THIS
import { CreateRoleDialog } from "@/components/dashboard/create-role-dialog"; // <--- Ensure this is imported too

export default async function StaffPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
  });
  if (!dbUser?.organizationId) redirect("/onboarding");

  // 1. Fetch Staff, Invites, AND Roles
  const [staffMembers, pendingInvites, roles] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: dbUser.organizationId },
      orderBy: { name: 'asc' }
    }),
    prisma.invite.findMany({
      where: { organizationId: dbUser.organizationId, status: "PENDING" }
    }),
    prisma.role.findMany({ // <--- Fetch Roles
      where: { organizationId: dbUser.organizationId },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <CreateRoleDialog /> {/* Button to create new roles like "Nurse" */}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Active Staff List */}
        <Card>
          <CardHeader><CardTitle>Active Staff</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {staffMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-zinc-900/50">
                
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.name} {member.type === "OWNER" && "(You)"}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                {/* Role Selector (Only show for STAFF, Owners are always Owners) */}
                {member.type === "OWNER" ? (
                  <Badge className="bg-zinc-900 text-white hover:bg-zinc-800">Owner</Badge>
                ) : (
                  <RoleSelect 
                    userId={member.id} 
                    initialRoleId={member.roleId} 
                    roles={roles} 
                  />
                )}
                
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right: Invite Form & Pending */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Invite New Member</CardTitle></CardHeader>
            <CardContent>
              <StaffInviteForm />
            </CardContent>
          </Card>

          {pendingInvites.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Pending Invites</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex justify-between items-center text-sm p-2 border border-dashed rounded bg-zinc-50 dark:bg-zinc-900/30">
                    <span className="text-zinc-500">{invite.email}</span>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}