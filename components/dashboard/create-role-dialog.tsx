"use client";

import { useState } from "react";
import { createRole } from "@/actions/roles";
import { PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShieldPlus } from "lucide-react";

export function CreateRoleDialog() {
  const [name, setName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const togglePerm = (perm: string) => {
    setSelectedPerms(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleCreate = async () => {
    if (!name) return;
    await createRole(name, selectedPerms);
    toast.success("Role created");
    setOpen(false);
    setName("");
    setSelectedPerms([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><ShieldPlus className="w-4 h-4 mr-2"/> Create Role</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Create New Role</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Role Name (e.g. Head Nurse)" value={name} onChange={e => setName(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(PERMISSIONS).map(([key, value]) => (
              <div key={value} className="flex items-center space-x-2 border p-2 rounded">
                <Checkbox 
                  id={value} 
                  checked={selectedPerms.includes(value)}
                  onCheckedChange={() => togglePerm(value)}
                />
                <label htmlFor={value} className="text-sm font-medium leading-none cursor-pointer">
                  {key.replace(/_/g, " ")}
                </label>
              </div>
            ))}
          </div>

          <Button onClick={handleCreate} className="w-full">Save Role</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}