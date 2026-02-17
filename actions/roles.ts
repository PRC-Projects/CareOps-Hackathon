"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createRole(name: string, permissions: string[]) {
  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0].emailAddress }
  });

  if (!dbUser?.organizationId) return { error: "Unauthorized" };

  try {
    await prisma.role.create({
      data: {
        name,
        permissions,
        organizationId: dbUser.organizationId
      }
    });
    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (e) {
    return { error: "Role creation failed" };
  }
}

export async function getRoles() {
  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0].emailAddress }
  });
  
  if (!dbUser?.organizationId) return [];

  return await prisma.role.findMany({
    where: { organizationId: dbUser.organizationId }
  });
}


export async function assignRole(userId: string, roleId: string) {
  const user = await currentUser();
  
  // 1. Verify the requester is an OWNER
  const dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0].emailAddress }
  });

  if (dbUser?.type !== "OWNER") {
    return { error: "Only Owners can assign roles" };
  }

  try {
    // 2. Update the target user
    await prisma.user.update({
      where: { id: userId },
      data: { roleId: roleId }
    });
    
    revalidatePath("/dashboard/staff"); // Refresh the UI instantly
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to assign role" };
  }
}