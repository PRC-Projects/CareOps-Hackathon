// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that are public (no login required)
// 1. /sign-in & /sign-up: Auth pages
// 2. /api/webhooks(.*): For Stripe/Clerk webhooks later
// 3. /book(.*): The public booking page for customers (Requirement 7: Customers DO NOT log in)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/webhooks(.*)',
  '/book(.*)',
  '/',
  '/join(.*)',
  "/Hero.mp4",  // <--- ADD THIS (Exact name as in public folder)
  "/Fluid.mp4"
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is NOT public, enforce authentication
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};