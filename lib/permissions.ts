export const PERMISSIONS = {
  VIEW_DASHBOARD: "view:dashboard",
  
  // Bookings
  VIEW_BOOKINGS: "view:bookings",
  MANAGE_BOOKINGS: "manage:bookings", // Can cancel/complete
  
  // Inbox
  VIEW_INBOX: "view:inbox",
  
  // Inventory
  VIEW_INVENTORY: "view:inventory",
  MANAGE_INVENTORY: "manage:inventory", // Can add/edit items
  
  // Staff
  MANAGE_STAFF: "manage:staff", // Can invite others
  
  // Settings
  VIEW_SETTINGS: "view:settings",
  
  // Forms
  MANAGE_FORMS: "manage:forms",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const DEFAULT_OWNER_PERMISSIONS = Object.values(PERMISSIONS);