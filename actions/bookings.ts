"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as any; // "COMPLETED" | "CANCELLED"
  
  await prisma.booking.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/dashboard/bookings");
}

export async function saveBookingNote(bookingId: string, note: string) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { notes: note }
  });
  revalidatePath("/dashboard/bookings");
}