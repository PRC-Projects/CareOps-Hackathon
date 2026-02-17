"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CalendarDays, 
  MessageSquare, 
  FileText, 
  Package, 
  Settings, 
  Users 
} from "lucide-react";
import { PERMISSIONS } from "@/lib/permissions";

// Define the routes with their required permission
const routes = [
  { 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    href: "/dashboard", 
    color: "text-sky-500",
    permission: PERMISSIONS.VIEW_DASHBOARD 
  },
  { 
    label: "Bookings", 
    icon: CalendarDays, 
    href: "/dashboard/bookings", 
    color: "text-violet-500",
    permission: PERMISSIONS.VIEW_BOOKINGS
  },
  { 
    label: "Inbox", 
    icon: MessageSquare, 
    href: "/dashboard/inbox", 
    color: "text-pink-700",
    permission: PERMISSIONS.VIEW_INBOX
  },
  { 
    label: "Forms", 
    icon: FileText, 
    href: "/dashboard/forms", 
    color: "text-orange-700",
    permission: PERMISSIONS.MANAGE_FORMS
  },
  { 
    label: "Inventory", 
    icon: Package, 
    href: "/dashboard/inventory", 
    color: "text-emerald-500",
    permission: PERMISSIONS.VIEW_INVENTORY
  },
  { 
    label: "Team", 
    icon: Users, 
    href: "/dashboard/staff", 
    color: "text-zinc-500",
    permission: PERMISSIONS.MANAGE_STAFF
  },
  { 
    label: "Settings", 
    icon: Settings, 
    href: "/dashboard/settings", 
    color: "text-gray-500",
    permission: PERMISSIONS.VIEW_SETTINGS 
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  // CRITICAL: You must define the prop here
  userPermissions?: string[]; 
}

// CRITICAL: You must destructure 'userPermissions' here
export function Sidebar({ className, userPermissions = [] }: SidebarProps) {
  const pathname = usePathname();

  // Filter the routes
  // We use "userPermissions || []" to be safe against undefined errors
  const visibleRoutes = routes.filter(route => 
    (userPermissions || []).includes(route.permission)
  );

  return (
    <div className={cn("space-y-4 py-4 flex flex-col h-full bg-zinc-900 text-white", className)}>
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">CareOps</h1>
        </Link>
        <div className="space-y-1">
          {visibleRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}