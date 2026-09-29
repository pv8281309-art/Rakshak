import React from 'react';
import { Shield, Activity, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutUsSection: React.FC = () => {
  const highlights = [
    { num: '< 3s', label: 'Detection Latency', sub: 'Instant automated trigger' },
    { num: 'Sub-Meter', label: 'GPS Accuracy', sub: 'Pinpoint highway corridor' },
    { num: '4 Nodes', label: 'Response Network', sub: 'Admin, Ambulance, Hospital, Family' },
    { num: '100%', label: 'Hands-Free', sub: 'Active even if unconscious' }
  ];

  return (
    <section 
      id="about-us" 
      className="py-24 text-white font-sans relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/back.png")' }}
    >
      
      {/* Dark overlay for contrast and text readability */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-xs font-mono font-bold tracking-widest text-red-400 uppercase mb-3 shadow-md backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>ABOUT US · MISSION & SYSTEM OVERVIEW</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight uppercase">
            <span className="text-white">WHAT IS </span>
            <span className="text-red-500">OPERATION </span>
            <span className="text-amber-400">RAKSHAK 3.0?</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            An intelligent accident detection and emergency response ecosystem designed to detect incidents, locate victims, alert responders, and connect families, ambulances, and hospitals.
          </p>
        </div>

        {/* Executive Overview Card with Transparent Panel */}
        <div className="bg-slate-950/60 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-700/50 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold border border-amber-500/30 backdrop-blur-md">
                <Shield size={13} className="text-amber-400" />
                <span>OFFICIAL SYSTEM DEFINITION</span>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                <span className="text-white">BRIDGING THE </span>
                <span className="text-red-500">FATAL TIME GAP </span>
                <span className="text-slate-200">IN ROAD ACCIDENTS.</span>
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Every year, tens of thousands of lives are lost on highways simply because emergency services arrive too late. In catastrophic impacts, vehicle occupants are frequently unconscious or trapped, unable to reach a smartphone or communicate their exact position on remote expressways.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                <strong className="text-amber-400 font-bold">Operation Rakshak 3.0</strong> solves this fatal bottleneck by automating the entire emergency response chain: from the physical shock of impact, through precision satellite location, to synchronized multi-agency notification across ambulances, trauma centers, and family guardians.
              </p>
            </div>

            {/* Quick Stat Highlights - Transparent Panels */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
              {highlights.map((h, i) => (
                <div key={i} className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
                      {h.num}
                    </span>
                    <h4 className="text-xs font-bold text-white uppercase mt-1 leading-tight">
                      {h.label}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-normal">
                    {h.sub}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
