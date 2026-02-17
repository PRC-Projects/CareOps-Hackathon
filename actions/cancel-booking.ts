"use server";

import { prisma } from "@/lib/db";
import { sendBookingCancellation } from "@/lib/mail";
import { revalidatePath } from "next/cache";

export async function cancelBooking(id: string, email: string, name: string, service: string, reason: string) {
  // 1. Update Status
  await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" }
  });

  // 2. Send Email
  await sendBookingCancellation(email, name, service, reason);

  revalidatePath("/dashboard/bookings");
}