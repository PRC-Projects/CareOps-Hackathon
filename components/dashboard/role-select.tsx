"use client";

import { useState } from "react";
import { assignRole } from "@/actions/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RoleSelectProps {
  userId: string;
  initialRoleId?: string | null;
  roles: { id: string; name: string }[]; // List of available roles
}

export function RoleSelect({ userId, initialRoleId, roles }: RoleSelectProps) {
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState(initialRoleId || "");

  const handleValueChange = async (roleId: string) => {
    setLoading(true);
    const result = await assignRole(userId, roleId);
    
    if (result.success) {
      setCurrentRole(roleId);
      toast.success("Role updated successfully");
    } else {
      toast.error(result.error || "Failed to update role");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Select 
        disabled={loading} 
        onValueChange={handleValueChange} 
        value={currentRole}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
          ) : null}
          <SelectValue placeholder="Assign Role" />
        </SelectTrigger>
        <SelectContent>
          {roles.length === 0 ? (
            <div className="p-2 text-xs text-muted-foreground text-center">
              No roles created yet
            </div>
          ) : (
            roles.map((role) => (
              <SelectItem key={role.id} value={role.id} className="text-xs">
                {role.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}