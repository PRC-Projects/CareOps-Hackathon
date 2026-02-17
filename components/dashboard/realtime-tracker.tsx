"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function RealtimeTracker({ orgId }: { orgId: string }) {
  const router = useRouter();

  useEffect(() => {
    console.log("🟢 Realtime Tracker Active for Org:", orgId);

    // Subscribe to changes
    const channel = supabase
      .channel("dashboard-updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          // We listen to multiple tables
          table: "Booking",
          filter: `organizationId=eq.${orgId}`,
        },
        (payload) => {
          console.log("⚡ Change detected:", payload);
          toast.info("New Booking Received! 🚀");
          router.refresh(); // <--- THE MAGIC: Refreshes Server Data
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "InventoryItem",
          filter: `organizationId=eq.${orgId}`,
        },
        () => {
          toast.warning("Inventory Updated");
          router.refresh();
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, orgId]);

  return null; // This component renders nothing visually
}
