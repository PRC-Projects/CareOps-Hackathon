// actions/create-organization.ts
"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db"; // We need to create this file next!
import { redirect } from "next/navigation";

export async function createOrganization(data: any) {
  const user = await currentUser();

  if (!user || !user.emailAddresses[0]) {
    throw new Error("User not authenticated");
  }

  // 1. Generate a "slug" for the URL (e.g., "Pritam's Dental" -> "pritams-dental")
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  try {
    // 2. The Transaction: Do everything or nothing
    await prisma.$transaction(async (tx) => {
      
      // A. Create the Organization
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug: `${slug}-${Math.floor(Math.random() * 1000)}`, // Ensure uniqueness
          email: data.email,
          timezone: data.timezone,
        },
      });

      // B. Create the User (The Owner) linked to that Org
      await tx.user.create({
        data: {
          id: user.id, // Use Clerk ID matches our DB ID
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName} ${user.lastName}`,
          type: "OWNER",
          organizationId: org.id,
        },
      });

      // C. Create the Services (Bulk Insert)
      if (data.services && data.services.length > 0) {
        await tx.service.createMany({
          data: data.services.map((s: any) => ({
            name: s.name,
            durationMin: s.duration,
            price: s.price,
            organizationId: org.id,
          })),
        });
      }
    });

  } catch (error) {
    console.error("Database Creation Failed:", error);
    return { success: false, error: "Failed to create workspace" };
  }

  // 3. Redirect to Dashboard (Must happen outside try/catch)
  redirect("/dashboard");
}