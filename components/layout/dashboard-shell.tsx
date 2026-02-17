"use client";

import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

// Add interface for the new prop
interface DashboardShellProps {
  children: React.ReactNode;
  userPermissions: string[]; // <--- NEW PROP
}

export default function DashboardShell({ children, userPermissions }: DashboardShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      
      {/* Pass permissions to Sidebar */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50">
         <Sidebar userPermissions={userPermissions} className="h-full border-r border-zinc-800" />
      </aside>

      <main className="flex-1 flex flex-col h-full relative overflow-hidden md:pl-72 transition-all">
        {/* Pass permissions to TopNav (Mobile Sidebar needs them too!) */}
        <TopNav userPermissions={userPermissions} />
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 overflow-y-auto p-4 md:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}