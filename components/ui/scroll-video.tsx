"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // 1. Wait for video metadata to load
  const handleMetadataLoaded = () => {
    if (videoRef.current && videoRef.current.duration) {
      setIsVideoReady(true);
    }
  };

  useGSAP(() => {
    // 2. Do not run GSAP until video duration is known
    if (!isVideoReady || !containerRef.current || !videoRef.current) return;

    const video = videoRef.current;
    
    // 3. Create the Scroll Scrubbing Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top", 
        end: "+=400%", // Longer scroll distance for smoother playback
        scrub: 1,      // 1 second lag for smoothness
        pin: true,     // Pin the container
        onUpdate: (self) => {
          // Force scrub logic if timeline update fails
          // This maps scroll progress (0 to 1) to video duration
          if (video.duration) {
            const scrollPos = self.progress * video.duration;
             // Use fastSeek if available (smoother), else currentTime
            if (Number.isFinite(scrollPos)) {
               video.currentTime = scrollPos;
            }
          }
        }
      },
    });

    // 4. Force a refresh to ensure start/end positions are correct
    ScrollTrigger.refresh();

  }, { scope: containerRef, dependencies: [isVideoReady] });

  return (
    <div ref={containerRef} className="relative h-screen w-full bg-black overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 opacity-0 animate-in fade-in zoom-in duration-1000 delay-300">
          From Chaos to Clarity
        </h2>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/Landing Page/CareOps.mp4" 
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={handleMetadataLoaded}
        />
      </div>
      
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
}