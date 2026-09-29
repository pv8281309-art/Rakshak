import React from 'react';
import { Shield } from 'lucide-react';

export const MissionSection: React.FC = () => {
  return (
    <section id="about" className="relative py-28 bg-slate-900 text-white overflow-hidden font-sans">
      {/* Subtle road / emergency background atmosphere */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=2000&q=80')`,
          filter: 'blur(3px)'
        }}
      />
      
      {/* Subtle dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/80 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Clean Logo Crest */}
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Shield size={24} />
        </div>

        {/* Big Cinematic Editorial Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] uppercase">
          THE MOMENT AN ACCIDENT HAPPENS,<br />
          <span className="text-red-500">RAKSHAK STARTS THE RESPONSE.</span>
        </h2>

        {/* Supporting Line */}
        <div className="mt-8 inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-800/60 border border-slate-700 text-slate-300 text-sm sm:text-base font-mono tracking-widest font-semibold uppercase">
          <span>DETECT</span>
          <span className="text-slate-600">·</span>
          <span>LOCATE</span>
          <span className="text-slate-600">·</span>
          <span>ALERT</span>
          <span className="text-slate-600">·</span>
          <span className="text-red-400">RESPOND</span>
        </div>

      </div>
    </section>
  );
};
