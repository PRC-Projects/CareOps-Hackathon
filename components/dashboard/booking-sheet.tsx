"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { VoiceNote } from "./voice-note";
import { saveBookingNote } from "@/actions/bookings";
import { format } from "date-fns";
import { Calendar, Clock, User, Phone } from "lucide-react";

export function BookingSheet({ booking, open, onOpenChange }: any) {
  if (!booking) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] p-4 overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle>Booking Details</SheetTitle>
              <SheetDescription>ID: {booking.id.slice(-6)}</SheetDescription>
            </div>
            <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"}>
              {booking.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* 1. Customer Info */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-3">
            <h4 className="text-sm font-medium text-zinc-500">CUSTOMER</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold">
                {booking.contact.name[0]}
              </div>
              <div>
                <div className="font-semibold">{booking.contact.name}</div>
                <div className="text-sm text-muted-foreground">{booking.contact.email}</div>
              </div>
            </div>
          </div>

          {/* 2. Service Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </div>
              <div className="font-medium">{format(new Date(booking.startTime), "MMM d, yyyy")}</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Time
              </div>
              <div className="font-medium">{format(new Date(booking.startTime), "h:mm a")}</div>
            </div>
          </div>

          {/* 3. THE VOICE NOTE (Operational Magic) */}
          <div>
            <h4 className="text-sm font-medium mb-2">Service Notes</h4>
            <VoiceNote 
              bookingId={booking.id}
              defaultValue={booking.notes || ""}
              onSave={async (note) => {
                await saveBookingNote(booking.id, note);
              }} 
            />
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}