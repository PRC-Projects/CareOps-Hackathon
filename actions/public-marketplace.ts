"use server";

import { prisma } from "@/lib/db";

export async function getAllBusinesses(query?: string) {
  // 1. Fetch businesses that have at least one service (active ones)
  const businesses = await prisma.organization.findMany({
    where: {
      services: { some: {} }, // Only show businesses with services
      name: {
        contains: query || "", // Simple search by name
        mode: 'insensitive'
      }
    },
    include: {
      services: true,
      _count: { select: { bookings: true } } // Show "Popularity"
    },
    take: 20, // Pagination limit
    orderBy: { createdAt: 'desc' }
  });

  const plainBusinesses = businesses.map(biz => ({
    ...biz,
    services: biz.services.map(service => ({
      ...service,
      price: service.price.toNumber() // <--- THIS SOLVES THE ERROR
    }))
  }));

  return plainBusinesses;
}