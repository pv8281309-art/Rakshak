import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Compass } from 'lucide-react';

export const FinalCTASection: React.FC = () => {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="py-28 font-sans relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/mini-1.png")' }}
    >
      {/* Ultra-light transparent overlay so mini-1.png and the car are fully visible */}
      <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-950/20 backdrop-blur-xs rounded-3xl p-8 sm:p-14 border border-amber-500/20 shadow-2xl text-center relative overflow-hidden">
          
          {/* Logo Badge */}
          <div className="w-14 h-14 rounded-2xl bg-slate-900/60 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-lg backdrop-blur-md">
            <Shield size={26} className="text-red-500" />
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] uppercase max-w-4xl mx-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            <span className="text-amber-400">READY TO EXPLORE </span>
            <br className="hidden sm:inline" />
            <span className="text-red-500 drop-shadow-[0_4px_16px_rgba(239,68,68,0.8)]">RAKSHAK?</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-100 max-w-lg mx-auto font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            Access the connected emergency-response ecosystem.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-sm font-black tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>LOGIN TO RAKSHAK</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => scrollTo('how-it-works')}
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-950/40 hover:bg-amber-400/10 text-amber-400 border border-amber-500/50 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs"
            >
              <Compass size={16} />
              <span>EXPLORE THE SYSTEM</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-center gap-6 text-xs text-white/90 font-mono">
            <span>● 4 CONNECTED ROLES</span>
            <span>·</span>
            <span>● ZERO DELAY RELAY</span>
            <span>·</span>
            <span>● VERIFIED TELEMETRY</span>
          </div>

        </div>
      </div>
    </section>
  );
};
