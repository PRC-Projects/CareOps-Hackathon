"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInviteDetails, acceptInvite } from "@/actions/join-staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser(); 
  const token = params.token as string;

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 1. Load Invite Details
  useEffect(() => {
    async function load() {
      const data = await getInviteDetails(token);
      if (data) {
        setInvite(data);
      } else {
        toast.error("Invalid invite link");
      }
      setLoading(false);
    }
    load();
  }, [token]);

  // 2. Handle Joining
  const handleJoin = async () => {
    setProcessing(true);

    if (!user) {
      const returnUrl = `/join/${token}`;
      router.push(`/sign-up?redirect_url=${returnUrl}`);
      return;
    }

    const result = await acceptInvite(token);
    
    // 🛑 FIX: Use 'in' operator to safely check for success property
    if ("success" in result && result.success) {
      toast.success(`Welcome to ${invite.organization.name}!`);
      router.push("/dashboard"); 
    } else {
      // TypeScript now knows this is the error branch
      // We explicitly cast to the error type to be safe accessing properties
      const errorResult = result as { error: string; redirectTo?: string };

      if (errorResult.redirectTo) {
        router.push(errorResult.redirectTo);
      } else {
        toast.error(errorResult.error || "Failed to join");
        setProcessing(false);
      }
    }
  };

  if (loading || !isLoaded) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!invite) return <div className="flex h-screen items-center justify-center">Invite Invalid or Expired</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-violet-600" />
          </div>
          <CardTitle className="text-2xl">Join {invite.organization.name}</CardTitle>
          <CardDescription>
            You have been invited to join the team as a <strong>Staff Member</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg text-sm text-center">
            <p className="text-zinc-500 mb-1">Invited Email</p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{invite.email}</p>
          </div>

          <div className="flex flex-col gap-3">
            {!user && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded text-center border border-amber-200">
                You will need to create an account or sign in first.
              </div>
            )}
            
            <Button size="lg" className="w-full" onClick={handleJoin} disabled={processing}>
              {processing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</>
              ) : (
                <>Accept Invitation <ShieldCheck className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}