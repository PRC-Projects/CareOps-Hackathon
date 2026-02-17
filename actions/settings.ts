"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// --- ORGANIZATION SETTINGS ---
export async function updateOrganization(formData: FormData) {
  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({ where: { email: user?.emailAddresses[0].emailAddress } });
  if (!dbUser?.organizationId) return { error: "Unauthorized" };

  await prisma.organization.update({
    where: { id: dbUser.organizationId },
    data: {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
    }
  });
  revalidatePath("/dashboard/settings");
  return { success: true };
}

// --- SERVICE MANAGEMENT ---
export async function upsertService(id: string | undefined, data: any) {
  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({ where: { email: user?.emailAddresses[0].emailAddress } });
  if (!dbUser?.organizationId) return { error: "Unauthorized" };

  // data = { name, price, durationMin, formId, ... }

  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    await prisma.service.create({
      data: { ...data, organizationId: dbUser.organizationId }
    });
  }
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteService(id: string) {
  await prisma.service.delete({ where: { id } });
  revalidatePath("/dashboard/settings");
  return { success: true };
}