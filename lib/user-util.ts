// lib/user-util.ts
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { DEFAULT_OWNER_PERMISSIONS } from "@/lib/permissions";

export async function getCurrentUserPermissions() {
  const user = await currentUser();
  if (!user) return [];

  const dbUser = await prisma.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
    include: { role: true }
  });

  if (!dbUser) return [];

  // 1. If Owner, return ALL permissions
  if (dbUser.type === "OWNER") {
    return DEFAULT_OWNER_PERMISSIONS;
  }

  // 2. If Staff, return their Role's permissions (or empty if no role)
  if (dbUser.role) {
    return dbUser.role.permissions;
  }

  return []; // Fallback
}