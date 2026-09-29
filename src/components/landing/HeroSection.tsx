import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Silently handle autoplay restrictions
      });

      const handleEnded = () => {
        video.currentTime = 0;
        video.play().catch(() => {});
      };

      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen overflow-hidden flex flex-col justify-center pt-32 pb-20 md:pt-40 md:pb-28 bg-slate-950 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/back.png")' }}
    >

      {!videoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 z-0 w-full h-full object-cover"
          onError={() => setVideoError(true)}
        >
          <source src="/video2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <div className="absolute inset-0 z-[1] bg-black/40 pointer-events-none" />

      {/* Existing Hero Content */}
      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">

        {/* Top Eyebrow & Status */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-950/80 border border-red-500/40 text-white text-xs font-semibold mb-6 shadow-2xl backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] font-black bg-gradient-to-r from-white via-slate-200 to-red-400 bg-clip-text text-transparent">
              OPERATION RAKSHAK 3.0
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            WHEN EVERY SECOND
            <br />

            <span className="text-white">
              MATTERS, RAKSHAK
            </span>

            <br />

            <span className="text-red-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.6)]">
              RESPONDS.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-white/95 max-w-2xl leading-relaxed font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            An intelligent accident detection and emergency response ecosystem
            designed to detect incidents, locate victims, alert responders, and
            connect families, ambulances, and hospitals.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">

            <button
              onClick={() => scrollTo('about-us')}
              className="w-full sm:w-auto px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>EXPLORE RAKSHAK</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => scrollTo('how-it-works')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
            >
              <span>SEE HOW IT WORKS</span>
            </button>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 flex flex-col items-center justify-center text-slate-400">

          <button
            onClick={() => scrollTo('about-us')}
            className="flex flex-col items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer group"
            aria-label="Scroll to next section"
          >
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-300 group-hover:text-red-400 transition-colors">
              Scroll to explore
            </span>

            <ChevronDown
              size={18}
              className="animate-bounce text-red-500"
            />
          </button>

        </div>

      </div>
    </section>
  );
};
