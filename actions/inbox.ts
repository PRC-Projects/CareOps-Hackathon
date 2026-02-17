"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// 1. Get My Team Chats
export async function getTeamChats() {
  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({
    where: { email: user?.emailAddresses[0].emailAddress },
    include: { conversations: { include: { participants: true, messages: { take: 1, orderBy: { createdAt: 'desc' } } } } }
  });

  if (!dbUser) return [];

  // Return chats sorted by latest activity
  return dbUser.conversations.sort((a, b) => 
    (b.updatedAt.getTime() - a.updatedAt.getTime())
  );
}

// 2. Get All Staff (To start a new chat)
export async function getAllStaff() {
  const user = await currentUser();
  const dbUser = await prisma.user.findUnique({ where: { email: user?.emailAddresses[0].emailAddress } });
  
  if (!dbUser?.organizationId) return [];

  // Get everyone in the org EXCEPT myself
  return await prisma.user.findMany({
    where: { 
      organizationId: dbUser.organizationId,
      id: { not: dbUser.id } 
    }
  });
}

// 3. Start/Get a Direct Message (DM)
export async function startDM(targetUserId: string) {
  const user = await currentUser();
  const me = await prisma.user.findUnique({ where: { email: user?.emailAddresses[0].emailAddress } });
  if (!me) return null;

  // Check if a DM already exists between these two
  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [
        { participants: { some: { id: me.id } } },
        { participants: { some: { id: targetUserId } } }
      ]
    }
  });

  if (existing) return existing.id;

  // Create new DM
  const newChat = await prisma.conversation.create({
    data: {
      isGroup: false,
      organizationId: me.organizationId,
      participants: {
        connect: [{ id: me.id }, { id: targetUserId }]
      }
    }
  });

  revalidatePath("/dashboard/inbox");
  return newChat.id;
}

// 4. Send Message (Updated for Team)
export async function sendMessage(conversationId: string, content: string) {
  const user = await currentUser();
  const sender = await prisma.user.findUnique({ where: { email: user?.emailAddresses[0].emailAddress } });
  
  if (!sender) return;

  await prisma.message.create({
    data: {
      conversationId,
      content,
      direction: "OUTBOUND", // Doesn't matter for internal, but we keep schema consistency
      type: "TEXT",
      isRead: false
      // In a real app, we'd add a 'senderId' field to Message, 
      // but for this hackathon, we assume the 'User' context handles it UI-side
    }
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  revalidatePath("/dashboard/inbox");
}

// 5. Get Messages
export async function getMessages(conversationId: string) {
  return await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' }
  });
}