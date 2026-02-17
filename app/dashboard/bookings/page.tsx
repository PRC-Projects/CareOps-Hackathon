import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { BookingFeed } from "@/components/dashboard/booking-feed"; 

export default async function BookingsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
  });

  if (!dbUser?.organizationId) redirect("/onboarding");

  // 1. Fetch Bookings
  const bookings = await prisma.booking.findMany({
    where: { organizationId: dbUser.organizationId },
    include: { contact: true, service: true },
    orderBy: { startTime: 'desc' } 
  });

  // 2. FIX: Convert Decimal objects to plain Numbers
  const plainBookings = bookings.map((booking) => ({
    ...booking,
    service: {
      ...booking.service,
      // Convert the Decimal to a number
      price: booking.service.price.toNumber() 
    }
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bookings</h1>
      </div>

      {/* 3. Pass the CLEAN data to the Client Component */}
      <BookingFeed initialBookings={plainBookings} />
    </div>
  );
}