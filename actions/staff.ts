"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sendStaffInviteEmail } from "@/lib/mail";

export async function inviteStaff(email: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized" };

  const owner = await prisma.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
    include: { organization: true }
  });

  // 🛑 FIX: Change 'owner.role' to 'owner.type'
  if (!owner || owner.type !== "OWNER") return { error: "Only owners can invite" };

  const token = Math.random().toString(36).substring(2, 15);
  
  try {
    await prisma.invite.create({
      data: {
        email,
        organizationId: owner.organizationId,
        token,
        type: "STAFF" // This is already correct in your file
      }
    });
    
    await sendStaffInviteEmail(email, token, owner.organization.name);

    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Invite already exists or failed" };
  }
}