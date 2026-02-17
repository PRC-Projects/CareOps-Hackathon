"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getInviteDetails(token: string) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { organization: true }
  });
  return invite;
}

export async function acceptInvite(token: string) {
  const user = await currentUser();

  // 1. If not logged in, we can't link them yet.
  if (!user) {
    return { error: "Unauthorized", redirectTo: "/sign-up" };
  }

  const email = user.emailAddresses[0].emailAddress;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 2. Validate Invite
      const invite = await tx.invite.findUnique({
        where: { token }
      });

      if (!invite) throw new Error("Invalid or expired invite");
      if (invite.status === "ACCEPTED") throw new Error("Invite already used");

      // 3. Create or Update the User Record
      // We upsert because they might have signed up but have no role yet
      await tx.user.upsert({
        where: { email: email },
        update: {
          type: invite.type,
          roleId: invite.roleId,
          organizationId: invite.organizationId
        },
        create: {
          id: user.id,
          email: email,
          name: `${user.firstName} ${user.lastName}`,
          type: invite.type,
          organizationId: invite.organizationId
        }
      });

      // 4. Mark invite as used (or delete it)
      await tx.invite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" }
      });

      return { success: true };
    });

    return result;

  } catch (error) {
    console.error("Join Error:", error);
    return { error: "Failed to join organization" };
  }
}