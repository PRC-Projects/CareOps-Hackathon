import Link from "next/link";
import { getAllBusinesses } from "@/actions/public-marketplace";
import { ThreeDCard } from "@/components/ui/3d-card";
import { HeroVideoBackground } from "@/components/ui/hero-video-background"; // <--- NEW
import { VelocityScroll } from "@/components/ui/velocity-scroll"; // <--- NEW
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function LandingPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q;
  const businesses = await getAllBusinesses(query);

  return (
    <main className="min-h-screen relative overflow-x-hidden selection:bg-violet-500/30">
      
      {/* 1. HERO VIDEO BACKGROUND */}
      <HeroVideoBackground />

      {/* 2. NAVBAR (Transparent & Floating) */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/10 dark:bg-black/20 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(124,58,237,0.5)]">C</div>
          <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">CareOps</span>
        </div>
        <div className="flex gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-zinc-900 dark:text-white hover:bg-white/20">Login</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 border border-violet-500/50">
              List Business
            </Button>
          </Link>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="pt-40 pb-20 px-4 text-center relative max-w-5xl mx-auto z-10">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-sm text-violet-600 dark:text-violet-300 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
          ✨ The Future of Service Management
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 text-zinc-900 dark:text-white drop-shadow-2xl">
          Operations, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-500 animate-pulse">
            Unchained.
          </span>
        </h1>
        
        <p className="text-xl text-zinc-700 dark:text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
          The unified operating system for service businesses. Book appointments, manage inventory, and automate chaos—all from one tab.
        </p>

        {/* Floating Search Bar with Glassmorphism */}
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 animate-tilt"></div>
          <form className="relative bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-full p-2 flex items-center border border-white/20 dark:border-zinc-800 shadow-2xl">
             <Search className="ml-4 h-5 w-5 text-zinc-500" />
             <Input 
               name="q" 
               defaultValue={query} 
               placeholder="Find a service (e.g. Dentist)..." 
               className="border-0 focus-visible:ring-0 bg-transparent text-lg h-12 flex-1 text-zinc-900 dark:text-white placeholder:text-zinc-500"
             />
             <Button type="submit" size="lg" className="rounded-full px-8 bg-zinc-900 text-white dark:bg-white dark:text-black hover:scale-105 transition-transform duration-200">
               Search
             </Button>
          </form>
        </div>
      </section>

      {/* 4. VELOCITY SCROLL BANNER */}
      <VelocityScroll />

      {/* 5. 3D CARD GRID */}
      <section className="px-4 md:px-28 py-24 max-w-9xl mx-auto relative">
        {/* Background Video 2 (Fluid) for this section */}
        <div className="absolute inset-0 -z-10 opacity-75 pointer-events-none mix-blend-screen">
           <video autoPlay muted loop playsInline className="w-full h-full object-cover">
             <source src="/Fluid.mp4" type="video/mp4" />
           </video>
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-zinc-50 dark:from-zinc-950 dark:via-transparent dark:to-black" />
        </div>

        <div className="flex items-center gap-4 mb-12">
           <div className="h-px bg-zinc-900 dark:bg-zinc-700 flex-1" />
           <span className="text-l font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-400">
             Explore Services
           </span>
           <div className="h-px bg-zinc-900 dark:bg-zinc-700 flex-1" />
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
             <h3 className="text-2xl font-bold mb-2">No businesses found</h3>
             <p className="text-zinc-500">Try searching for something else or add your own!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
            {businesses.map((biz) => (
              <ThreeDCard key={biz.id} biz={biz} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}