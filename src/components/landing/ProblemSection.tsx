import React, { useState } from 'react';
import { AlertCircle, MapPin, Radio, ArrowUpRight } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const problemCards = [
    {
      num: '01',
      title: 'ACCIDENT',
      subtitle: 'IMPACT & TRAUMA DETECTION',
      desc: 'An unexpected impact can leave a person unable to call for help.',
      detail: 'In severe collisions, drivers and passengers frequently experience disorientation, trauma, or unconsciousness, eliminating the ability to operate a mobile phone.',
      icon: AlertCircle,
      accent: 'border-red-500/40 text-red-500 bg-red-950/40',
      glow: 'group-hover:border-red-500/80 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
      bgImg: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80'
    },
    {
      num: '02',
      title: 'LOCATION',
      subtitle: 'SUB-METER GNSS PINPOINTING',
      desc: 'Emergency responders need accurate incident location information.',
      detail: 'Highway collisions often happen along remote expressway corridors with no landmark references, leading to critical delays while dispatchers guess the vehicle position.',
      icon: MapPin,
      accent: 'border-blue-500/40 text-blue-400 bg-blue-950/40',
      glow: 'group-hover:border-blue-500/80 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
      bgImg: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      num: '03',
      title: 'RESPONSE',
      subtitle: 'SYNCHRONIZED MULTI-AGENCY DISPATCH',
      desc: 'Relevant people and systems need timely emergency information.',
      detail: 'Without immediate telemetry sync, trauma hospitals receive zero advance triage data, ambulances get delayed in dispatch, and frantic families are left in the dark.',
      icon: Radio,
      accent: 'border-amber-500/40 text-amber-400 bg-amber-950/40',
      glow: 'group-hover:border-amber-500/80 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
      bgImg: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  return (
    <section id="problem" className="py-28 bg-[#090D16] text-white relative overflow-hidden font-sans border-y border-slate-800/80">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-xs font-mono font-bold tracking-widest text-red-400 uppercase mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>THE CRITICAL TIME GAP</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] uppercase">
            AN ACCIDENT TAKES SECONDS.<br />
            <span className="text-slate-400">GETTING HELP SHOULDN’T.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Every minute of delay after a vehicular impact reduces the survival rate. The golden hour begins at the moment of impact, not when someone finally notices.
          </p>
        </div>

        {/* 3 Dynamic Editorial Storytelling Panels */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {problemCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.num}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`group relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-slate-800/90 transition-all duration-500 ease-out hover:-translate-y-3 hover:scale-[1.02] flex flex-col justify-between overflow-hidden shadow-2xl ${card.glow}`}
              >
                {/* Faded Background Image Panel */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity transition-transform duration-700 group-hover:scale-110 group-hover:opacity-25 pointer-events-none -z-10"
                  style={{ backgroundImage: `url('${card.bgImg}')` }}
                />
                
                {/* Gradient vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent pointer-events-none -z-10" />

                <div>
                  {/* Big Editorial Number & Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-4xl font-black font-mono text-slate-600 group-hover:text-white transition-colors duration-300">
                      {card.num}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${card.accent} backdrop-blur-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  {/* Subtitle Tag */}
                  <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-1">
                    {card.subtitle}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-red-400 transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm font-semibold text-slate-200 leading-relaxed">
                    {card.desc}
                  </p>
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed font-normal">
                    {card.detail}
                  </p>
                </div>

                <div className="mt-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-slate-500">RAKSHAK RESOLUTION</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    AUTOMATED DISPATCH <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
