import React, { useState } from 'react';
import { Activity, ShieldCheck, MapPin, BellRing, Ambulance, ArrowUpRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const steps = [
    {
      step: '01',
      title: 'DETECT',
      subtitle: 'IMPACT SENSING',
      summary: 'Tri-axis accelerometers capture G-force deceleration instantly.',
      icon: Activity,
      accent: 'border-red-500/40 text-red-400 bg-red-950/40',
      glow: 'group-hover:border-red-500/80 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
      bgImg: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80'
    },
    {
      step: '02',
      title: 'VERIFY',
      subtitle: 'AI FALSE-TRIGGER FILTER',
      summary: 'Edge algorithms differentiate severe collisions from potholes.',
      icon: ShieldCheck,
      accent: 'border-amber-500/40 text-amber-400 bg-amber-950/40',
      glow: 'group-hover:border-amber-500/80 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
      bgImg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    },
    {
      step: '03',
      title: 'LOCATE',
      subtitle: 'SUB-METER GNSS PINPOINT',
      summary: 'Satellites fix exact latitude and longitude along expressways.',
      icon: MapPin,
      accent: 'border-blue-500/40 text-blue-400 bg-blue-950/40',
      glow: 'group-hover:border-blue-500/80 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
      bgImg: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      step: '04',
      title: 'ALERT',
      subtitle: 'ENCRYPTED TELEMETRY',
      summary: 'Instant dispatch packets transmit vehicle and severity data.',
      icon: BellRing,
      accent: 'border-purple-500/40 text-purple-400 bg-purple-950/40',
      glow: 'group-hover:border-purple-500/80 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
      bgImg: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'
    },
    {
      step: '05',
      title: 'RESPOND',
      subtitle: 'MULTI-AGENCY SYNC',
      summary: 'Ambulances and trauma centers vector directly to the scene.',
      icon: Ambulance,
      accent: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40',
      glow: 'group-hover:border-emerald-500/80 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
      bgImg: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  return (
    <section id="how-it-works" className="py-28 bg-[#090D16] text-white relative overflow-hidden font-sans border-b border-slate-800/80">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/5 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs font-mono font-bold tracking-widest text-blue-400 uppercase mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>SYSTEM WORKFLOW</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] uppercase">
            FROM IMPACT TO RESPONSE.<br />
            <span className="text-slate-400">AUTOMATED PRECISION.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            A continuous automated pipeline engineered to eliminate friction and delays between collision and medical intervention.
          </p>
        </div>

        {/* 5 Dynamic Workflow Panels */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={s.step}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`group relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800/90 transition-all duration-500 ease-out hover:-translate-y-3 hover:scale-[1.02] flex flex-col justify-between overflow-hidden shadow-2xl ${s.glow}`}
              >
                {/* Faded Background Image Panel */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity transition-transform duration-700 group-hover:scale-110 group-hover:opacity-25 pointer-events-none -z-10"
                  style={{ backgroundImage: `url('${s.bgImg}')` }}
                />

                {/* Gradient vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent pointer-events-none -z-10" />

                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black font-mono text-slate-600 group-hover:text-white transition-colors duration-300">
                      {s.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${s.accent} backdrop-blur-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-md`}>
                      <Icon size={18} />
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-1">
                    {s.subtitle}
                  </div>

                  {/* Title & Summary */}
                  <h3 className="text-xl font-black text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors duration-300">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-xs font-semibold text-slate-300 leading-relaxed">
                    {s.summary}
                  </p>
                </div>

                <div className="mt-8 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>TELEMETRY</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    ACTIVE <ArrowUpRight size={12} />
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
