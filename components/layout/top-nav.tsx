"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";

// Accept permissions prop
export function TopNav({ userPermissions }: { userPermissions: string[] }) {
  return (
    <div className="flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/20">
      
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-zinc-900 text-white border-zinc-800">
            {/* Pass permissions to Mobile Sidebar */}
            <Sidebar userPermissions={userPermissions} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}