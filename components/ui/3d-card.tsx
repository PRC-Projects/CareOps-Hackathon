"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ThreeDCard({ biz }: { biz: any }) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      className="relative h-96 w-full rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6 shadow-2xl group"
    >
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }} className="absolute inset-4 grid content-between">
        
        {/* Header */}
        <div>
           <div className="flex justify-between items-start">
             <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
               {biz.name.charAt(0)}
             </div>
             <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
               <Star className="w-3 h-3 mr-1 fill-yellow-500" /> 5.0
             </Badge>
           </div>
           
           <h3 className="mt-4 text-2xl font-bold text-white leading-tight group-hover:text-violet-400 transition-colors">
             {biz.name}
           </h3>
           <p className="text-sm text-zinc-400 flex items-center mt-2">
             <MapPin className="w-3 h-3 mr-1" /> {biz.address || "Online Service"}
           </p>
        </div>

        {/* Services Chips */}
        <div className="space-y-4">
           <div className="flex flex-wrap gap-2">
             {biz.services.slice(0, 3).map((s: any) => (
               <span key={s.id} className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                 {s.name}
               </span>
             ))}
           </div>

           {/* Call to Action */}
           <Link href={`/book/${biz.slug}`} className="block">
             <button className="w-full py-3 rounded-lg bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
               Book Now <ArrowRight className="w-4 h-4" />
             </button>
           </Link>
        </div>
      </div>
    </motion.div>
  );
}