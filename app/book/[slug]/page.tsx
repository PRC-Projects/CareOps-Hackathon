"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // To get the [slug]
import { getOrganizationBySlug, createBooking } from "@/actions/public-booking";
import { Calendar } from "@/components/ui/calendar"; // Shadcn Calendar
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, CheckCircle2, Clock } from "lucide-react";

export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedService, setSelectedService] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Fetch Data on Load
  useEffect(() => {
    async function load() {
      const data = await getOrganizationBySlug(slug);
      if (data) {
        setOrg(data);
      } else {
        toast.error("Business not found");
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  // Mock Time Slots (In a real app, these would come from the DB)
  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

  const handleSubmit = async () => {
    if (!selectedService || !date || !selectedTime || !formData.name || !formData.email) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    const result = await createBooking({
      slug,
      serviceId: selectedService.id,
      date: date,
      time: selectedTime,
      ...formData
    });

    if (result.success) {
      setIsSuccess(true);
      toast.success("Booking Confirmed!");
    } else {
      toast.error(result.error || "Something went wrong");
    }
    setIsSubmitting(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!org) return <div className="flex h-screen items-center justify-center">Business Not Found</div>;

  // SUCCESS STATE (Confirmation Page)
  if (isSuccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl mb-2">Booking Confirmed!</CardTitle>
          <CardDescription>
            You are all set for <strong>{selectedService.name}</strong> with <strong>{org.name}</strong>.
          </CardDescription>
          <div className="mt-8 p-4 bg-zinc-100 rounded-lg text-sm">
            <p>Date: {format(date!, "MMMM do, yyyy")}</p>
            <p>Time: {selectedTime}</p>
            <p className="mt-2 text-zinc-500">A confirmation email has been sent to {formData.email}.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Business Info & Services */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">{org.name}</h1>
            <p className="text-zinc-500 mt-2">Book an appointment online.</p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-900">Select Service</h3>
            {org.services.map((service: any) => (
              <div 
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedService?.id === service.id 
                    ? "border-black bg-zinc-900 text-white shadow-lg" 
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{service.name}</span>
                  <span className="font-bold">${service.price}</span>
                </div>
                <div className="flex items-center text-xs mt-2 opacity-80">
                  <Clock className="w-3 h-3 mr-1" /> {service.durationMin} mins
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Calendar & Form */}
        <Card className="md:col-span-2 border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
            <CardDescription>Choose a slot for {selectedService?.name || "your service"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* 1. Date & Time Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border mx-auto"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Disable past dates
              />
              <div className="grid grid-cols-2 gap-2 content-start">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            {/* 2. Customer Details */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Your Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    placeholder="+1 555 000 0000" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  placeholder="john@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <Button 
              className="w-full text-lg py-6" 
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedService || !selectedTime}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Confirming...</>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
