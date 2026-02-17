"use client";

import { useState } from "react";
import { upsertService, deleteService } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ServiceList({ initialServices, availableForms }: any) {
  const [editingService, setEditingService] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name"),
      price: parseFloat(formData.get("price") as string),
      durationMin: parseInt(formData.get("durationMin") as string),
      formId: formData.get("formId") === "none" ? null : formData.get("formId")
    };

    await upsertService(editingService?.id, data);
    setLoading(false);
    setOpen(false);
    setEditingService(null);
    toast.success("Service saved");
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure?")) return;
    await deleteService(id);
    toast.success("Service deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingService(null); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add New Service
        </Button>
      </div>

      <div className="grid gap-4">
        {initialServices.map((service: any) => (
          <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
            <div>
              <div className="font-medium">{service.name}</div>
              <div className="text-sm text-zinc-500">
                ${Number(service.price).toFixed(2)} • {service.durationMin} mins
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => { setEditingService(service); setOpen(true); }}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(service.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT/CREATE DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingService ? "Edit Service" : "New Service"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input name="name" defaultValue={editingService?.name} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input name="price" type="number" step="0.01" defaultValue={editingService?.price ? Number(editingService.price) : 0} required />
              </div>
              <div className="space-y-2">
                <Label>Duration (Minutes)</Label>
                <Input name="durationMin" type="number" defaultValue={editingService?.durationMin || 30} required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Required Intake Form</Label>
              <Select name="formId" defaultValue={editingService?.formId || "none"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a form..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No Form Required --</SelectItem>
                  {availableForms.map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Customers must fill this out when booking.</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Save Service"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}