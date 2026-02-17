import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MessageSquare, Package, AlertTriangle, Activity } from "lucide-react";
import { RealtimeTracker } from "@/components/dashboard/realtime-tracker";
import { startOfDay, endOfDay } from "date-fns";
import { OverviewGraph } from "@/components/dashboard/overview-graph";

export default async function DashboardPage() {
  const user = await currentUser();
  

  if (!user) redirect("/sign-in");

  // 1. Fetch the Organization linked to this user
  const dbUser = await prisma.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
    include: { organization: true }
  });

  if (!dbUser || !dbUser.organization) {
    redirect("/onboarding");
  }

  const { organization } = dbUser;
  const orgId = organization.id;

  // 2. REAL DATA FETCHING (Parallel Queries for Speed)
  const today = new Date();
  
  const [bookingsToday, newLeads, inventoryAlerts, recentActivity] = await Promise.all([
    // A. Count Bookings for TODAY
    prisma.booking.count({
      where: {
        organizationId: orgId,
        startTime: {
          gte: startOfDay(today),
          lte: endOfDay(today)
        }
      }
    }),

    // B. Count Unread Messages or New Conversations (Proxy for Leads)
    prisma.conversation.count({
      where: {
        contact: { organizationId: orgId },
        // logic: count conversations updated in last 24h or generally active
        updatedAt: {
          gte: startOfDay(today)
        }
      }
    }),

    // C. Count Low Stock Items
    prisma.inventoryItem.count({
      where: {
        organizationId: orgId,
        quantity: {
          lte: prisma.inventoryItem.fields.threshold // Where quantity <= threshold
        }
      }
    }),

    // D. Fetch Recent 5 Activities (Bookings or Messages)
    prisma.booking.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { contact: true, service: true }
    })
  ]);

  return (
    <div className="space-y-8">
        <RealtimeTracker orgId={orgId} />
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground border px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
             {organization.name}
          </span>
        </div>
      </div>

      {/* THE BENTO GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Bookings */}
        <Card className="border-l-4 border-l-violet-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings Today</CardTitle>
            <CalendarDays className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsToday}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        {/* Card 2: New Leads */}
        <Card className="border-l-4 border-l-pink-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <MessageSquare className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newLeads}</div>
            <p className="text-xs text-muted-foreground">
              Active today
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Inventory */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Alerts</CardTitle>
            <Package className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Items below threshold
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Forms (Placeholder logic for now) */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Forms</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Waiting for customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area (Recent Activity Feed) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <OverviewGraph />
        
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
               {recentActivity.length === 0 ? (
                 <p className="text-sm text-zinc-500">No activity yet.</p>
               ) : (
                 recentActivity.map((booking) => (
                   <div key={booking.id} className="flex items-center">
                     <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center mr-4">
                        <Activity className="h-4 w-4 text-violet-600" />
                     </div>
                     <div className="space-y-1">
                       <p className="text-sm font-medium leading-none">
                         New Booking: {booking.contact.name}
                       </p>
                       <p className="text-xs text-muted-foreground">
                         {booking.service.name} • {booking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                     </div>
                   </div>
                 ))
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}