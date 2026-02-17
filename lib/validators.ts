// lib/validators.ts
import { z } from "zod";

export const onboardingSchema = z.object({
  step1: z.object({
    name: z.string().min(2, "Business name is too short"),
    type: z.string().min(2, "Business type is required"), // e.g., "Dentist", "Salon"
  }),
  step2: z.object({
    description: z.string().optional(),
    services: z.array(z.object({
      name: z.string(),
      duration: z.number(),
      price: z.number(),
    })).min(1, "At least one service is required"),
  }),
  step3: z.object({
    email: z.string().email(),
    timezone: z.string(),
  })
});

export type OnboardingData = z.infer<typeof onboardingSchema>;