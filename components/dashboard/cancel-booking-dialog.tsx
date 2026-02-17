"use client";

import { useState } from "react";
import { cancelBooking } from "@/actions/cancel-booking";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { XCircle, Loader2 } from "lucide-react";

interface CancelProps {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
}

export function CancelBookingDialog({ bookingId, customerName, customerEmail, serviceName }: CancelProps) {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!reason) {
      toast.error("Please provide a reason");
      return;
    }
    setLoading(true);
    await cancelBooking(bookingId, customerEmail, customerName, serviceName, reason);
    toast.success("Booking cancelled & email sent");
    setOpen(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
          <XCircle className="w-4 h-4 mr-2" /> Cancel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Cancel Booking?</DialogTitle></DialogHeader>
        <div className="space-y-4">
           <p className="text-sm text-zinc-500">
             You are about to cancel <strong>{customerName}'s</strong> appointment for {serviceName}.
             An email notification will be sent immediately.
           </p>
           <Textarea 
             placeholder="Reason (e.g. Doctor is unavailable...)"
             value={reason}
             onChange={(e) => setReason(e.target.value)}
             className="min-h-[100px]"
           />
           <Button variant="destructive" className="w-full" onClick={handleCancel} disabled={loading}>
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancellation"}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}