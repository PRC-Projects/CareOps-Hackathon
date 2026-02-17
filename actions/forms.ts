"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// 1. Get All Forms
export async function getForms() {
  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0].emailAddress }
  });
  
  if (!dbUser?.organizationId) return [];

  return await prisma.form.findMany({
    where: { organizationId: dbUser.organizationId },
    include: { _count: { select: { submissions: true } } }
  });
}

// 2. Create/Update Form
export async function upsertForm(
  id: string | undefined, 
  name: string, 
  fields: any[]
) {
  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0].emailAddress }
  });

  if (!dbUser?.organizationId) return { error: "Unauthorized" };

  try {
    if (id) {
      // Update
      await prisma.form.update({
        where: { id },
        data: { name, fields }
      });
    } else {
      // Create
      await prisma.form.create({
        data: {
          name,
          fields,
          organizationId: dbUser.organizationId
        }
      });
    }
    revalidatePath("/dashboard/forms");
    return { success: true };
  } catch (e) {
    return { error: "Failed to save form" };
  }
}

// 3. Delete Form
export async function deleteForm(id: string) {
  try {
    await prisma.form.delete({ where: { id } });
    revalidatePath("/dashboard/forms");
    return { success: true };
  } catch (e) {
    return { error: "Failed to delete" };
  }
}