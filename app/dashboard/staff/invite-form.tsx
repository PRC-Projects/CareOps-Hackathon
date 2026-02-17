"use client";

import { useState } from "react";
import { inviteStaff } from "@/actions/staff"; // Uses your existing action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

export default function StaffInviteForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if(!email) return;
    setLoading(true);
    
    // Call Server Action
    const res = await inviteStaff(email);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Invitation sent to " + email);
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <Input 
        placeholder="colleague@example.com" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={handleInvite} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </Button>
    </div>
  );
}