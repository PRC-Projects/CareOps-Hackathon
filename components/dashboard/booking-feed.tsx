"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { CancelBookingDialog } from "@/components/dashboard/cancel-booking-dialog";
import { BookingSheet } from "@/components/dashboard/booking-sheet"; // The component you created in the previous step
import { updateBookingStatus } from "@/actions/bookings"; // We will move the server action here (see step 3)

export function BookingFeed({ initialBookings }: { initialBookings: any[] }) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  return (
    <>
      <div className="grid gap-4">
        {initialBookings.length === 0 ? (
          <Card className="p-8 text-center text-zinc-500">
            No bookings found. Share your booking link!
          </Card>
        ) : (
          initialBookings.map((booking) => (
            <Card 
              key={booking.id} 
              // CLICKING THE CARD OPENS THE SHEET
              onClick={() => setSelectedBooking(booking)}
              className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 cursor-pointer hover:border-violet-300 transition-colors"
            >
              <div className="flex items-start gap-4 pointer-events-none"> {/* pointer-events-none prevents text selection while clicking card */}
                <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-lg">
                  {format(new Date(booking.startTime), "d")}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{booking.contact.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {format(new Date(booking.startTime), "MMM yyyy")}</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {format(new Date(booking.startTime), "h:mm a")}</span>
                    <Badge variant="outline">{booking.service.name}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}> 
                {/* stopPropagation prevents the Sheet from opening when you just want to click 'Complete' */}
                
                <Badge className={
                  booking.status === "COMPLETED" ? "bg-green-500" : 
                  booking.status === "CANCELLED" ? "bg-red-500" : "bg-blue-500"
                }>
                  {booking.status}
                </Badge>
                
                {booking.status === "CONFIRMED" && (
                  <div className="flex gap-2 ml-4">
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="id" value={booking.id} />
                      <input type="hidden" name="status" value="COMPLETED" />
                      <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50 hover:text-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" /> Complete
                      </Button>
                    </form>
                    <CancelBookingDialog 
                          bookingId={booking.id}
                          customerName={booking.contact.name}
                          customerEmail={booking.contact.email}
                          serviceName={booking.service.name}
                        />
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* THE SLIDE-OVER SHEET */}
      <BookingSheet 
        booking={selectedBooking} 
        open={!!selectedBooking} 
        onOpenChange={(open: boolean) => !open && setSelectedBooking(null)} 
      />
    </>
  );
}