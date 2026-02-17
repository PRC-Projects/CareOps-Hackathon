"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Volume2, VolumeX } from "lucide-react";

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Global click listener for the body
    const handleBodyClick = () => {
      setIsMuted((prev) => {
        const newState = !prev;
        // User interaction allows us to unmute safely
        if (newState === false) {
             toast.success("Sound On 🔊", { duration: 1000 });
        } else {
             toast.info("Muted 🔇", { duration: 1000 });
        }
        return newState;
      });
    };

    document.body.addEventListener("click", handleBodyClick);

    // Cleanup
    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden group">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted} // Controlled by state
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-60 transition-opacity duration-1000"
      >
        <source src="/Hero.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white dark:from-black/80 dark:via-black/50 dark:to-zinc-950" />
      
      {/* Visual Indicator for the User */}
      <div className="absolute bottom-10 right-10 z-20 text-xs font-mono text-zinc-500 opacity-50">
        {isMuted ? <VolumeX className="w-4 h-4 inline mr-2" /> : <Volume2 className="w-4 h-4 inline mr-2" />}
        CLICK ANYWHERE TO {isMuted ? "UNMUTE" : "MUTE"}
      </div>
    </div>
  );
}