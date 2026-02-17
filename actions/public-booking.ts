// actions/public-booking.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendBookingConfirmation } from "@/lib/mail"; // <--- Import the mailer

export async function getOrganizationBySlug(slug: string) {
  return await prisma.organization.findUnique({
    where: { slug },
    include: { services: true },
  });
}

export async function createBooking(formData: any) {
  const { slug, serviceId, date, time, name, email, phone } = formData;

  // Parsing Time
  const [hours, minutes] = time.split(":").map(Number);
  const startDateTime = new Date(date);
  startDateTime.setHours(hours, minutes, 0, 0);

  try {
    const org = await prisma.organization.findUnique({ 
      where: { slug },
      include: { services: true } 
    });
    
    if (!org) throw new Error("Business not found");
    const service = org.services.find(s => s.id === serviceId);
    if (!service) throw new Error("Service not found");

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(startDateTime.getMinutes() + service.durationMin);

    // 🛑 1. CONFLICT CHECK
    const conflict = await prisma.booking.findFirst({
      where: {
        organizationId: org.id,
        status: "CONFIRMED",
        OR: [
           { startTime: { lte: startDateTime }, endTime: { gt: startDateTime } }, // Overlaps start
           { startTime: { lt: endDateTime }, endTime: { gte: endDateTime } },     // Overlaps end
           { startTime: { gte: startDateTime }, endTime: { lte: endDateTime } }   // Encompasses
        ]
      }
    });

    if (conflict) {
      return { success: false, error: "Time slot already booked. Please pick another." };
    }

    // ✅ 2. TRANSACTION (Save to DB)
    const result = await prisma.$transaction(async (tx) => {
      // Find or Create Customer
      let contact = await tx.contact.findFirst({
        where: { email, organizationId: org.id }
      });

      if (!contact) {
        contact = await tx.contact.create({
          data: { name, email, phone, organizationId: org.id }
        });
      }

      // Create Booking
      const booking = await tx.booking.create({
        data: {
          startTime: startDateTime,
          endTime: endDateTime,
          status: "CONFIRMED",
          contactId: contact.id,
          serviceId: service.id,
          organizationId: org.id,
        }
      });

      // Create Conversation Thread (for Inbox)
      let conversation = await tx.conversation.findFirst({ where: { contactId: contact.id } });
      if (!conversation) {
        conversation = await tx.conversation.create({ data: { contactId: contact.id } });
      }

      // Log System Message
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          type: "SYSTEM_ALERT",
          direction: "INBOUND",
          content: `New Booking: ${service.name} for ${startDateTime.toLocaleDateString()} at ${time}`,
          isRead: false
        }
      });

      return booking;
    });

    // 📧 3. SEND EMAIL (Non-blocking)
    // We don't await this because if email fails, the booking is still valid in DB
    sendBookingConfirmation(
      email, 
      name, 
      startDateTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }), 
      service.name
    ).catch(e => console.error("Email failed:", e));

    revalidatePath("/dashboard");
    return { success: true, bookingId: result.id };

  } catch (error) {
    console.error("Booking Error:", error);
    return { success: false, error: "Failed to book appointment" };
  }
}