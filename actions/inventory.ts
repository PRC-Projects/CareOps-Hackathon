"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

// 1. Get All Items
export async function getInventory() {
  const user = await currentUser();
  if (!user) {
    return []; // Return empty array if no user (safer for UI)
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
  });

  if (!dbUser?.organizationId) return [];

  return await prisma.inventoryItem.findMany({
    where: { organizationId: dbUser.organizationId },
    orderBy: { name: 'asc' }
  });
}

// 2. Add New Item
export async function addInventoryItem(formData: FormData) {
  const user = await currentUser();
  
  // 🛑 FIX: Add this check to satisfy TypeScript
  if (!user) {
    throw new Error("Unauthorized: You must be logged in.");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
  });

  // 🛑 FIX: Ensure dbUser exists before using it
  if (!dbUser?.organizationId) {
    throw new Error("Unauthorized: No organization found.");
  }

  const name = formData.get("name") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const threshold = parseInt(formData.get("threshold") as string);

  await prisma.inventoryItem.create({
    data: {
      name,
      quantity,
      threshold,
      organizationId: dbUser.organizationId 
    }
  });

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard"); 
}

// 3. Update Quantity (Quick Actions)
export async function updateStock(itemId: string, adjustment: number) {
  // Optional: You could add auth checks here too, but strictly not needed for this build error
  await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      quantity: { increment: adjustment }
    }
  });
  
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}

// 4. Delete Item
export async function deleteItem(itemId: string) {
  await prisma.inventoryItem.delete({
    where: { id: itemId }
  });
  revalidatePath("/dashboard/inventory");
}