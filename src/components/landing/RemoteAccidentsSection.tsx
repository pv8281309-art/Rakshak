import React from 'react';
import { Shield, AlertTriangle, Trees, MapPin, Users, Ambulance, CheckCircle2, Radio } from 'lucide-react';

export const RemoteAccidentsSection: React.FC = () => {
  return (
    <section id="remote-accidents" className="py-24 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>OPERATION RAKSHAK 3.0 · REMOTE & BLIND SPOT RECOVERY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
            WHEN ACCIDENTS HAPPEN <br />
            <span className="text-red-600">WHERE NO ONE IS WATCHING.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            On isolated mountain passes, dense forest highways, and remote country roads, accidents often occur without witnesses or bystanders. Discover how Operation Rakshak 3.0 bridges this fatal gap.
          </p>
        </div>

        {/* 3 Refined Scenario Cards with Uploaded Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Card 1 */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all">
            <div>
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img 
                  src="/express.png" 
                  alt="Expressway Collision Triage" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-[11px] font-mono text-white border border-white/20">
                  SCENARIO A: EXPRESSWAY
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-black text-slate-900 uppercase">
                  High-Speed Highway Collisions
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Multi-vehicle collisions on expressways where traffic congestion and chaos delay emergency reporting. Rakshak automates instant police and ambulance dispatch.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>DISPATCH TIME</span>
                <span className="text-emerald-600 font-bold">&lt; 3 SECONDS</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all">
            <div>
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img 
                  src="/forest.png" 
                  alt="Forest Road Rollover" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-950/80 backdrop-blur-md rounded-full text-[11px] font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Trees size={13} />
                  <span>SCENARIO B: FOREST PASS</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-black text-slate-900 uppercase">
                  Isolated Forest Road Turnovers
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Vehicles sliding off winding mountain or forest roads where there are zero witnesses. Occupants are often unconscious, making manual phone calls impossible.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>GPS LOCK IN FORESTS</span>
                <span className="text-emerald-600 font-bold">SUB-METER GNSS</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all">
            <div>
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img 
                  src="/rural.png" 
                  alt="Remote Rural Accident" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-red-950/80 backdrop-blur-md rounded-full text-[11px] font-mono text-red-300 border border-red-500/30 flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  <span>SCENARIO C: REMOTE RURAL</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-black text-slate-900 uppercase">
                  Remote Commercial Transports
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Commercial trucks and vehicles overturning in remote rural corridors. Rakshak 3.0 transmits exact coordinates to family and emergency fleets automatically.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>FAMILY NOTIFICATION</span>
                <span className="text-emerald-600 font-bold">INSTANT SMS / PUSH</span>
              </div>
            </div>
          </div>

        </div>

        {/* Operation Rakshak 3.0 Architecture Explanation Box */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-mono font-bold mb-4 border border-red-500/30">
                <Shield size={13} />
                <span>OPERATION RAKSHAK 3.0 ADVANCEMENT</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                HOW RAKSHAK 3.0 PROTECTS YOU IN BLIND SPOTS
              </h3>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                When an accident occurs in a forest or isolated highway where no one is around, traditional help never arrives in time. <strong className="text-white">Operation Rakshak 3.0</strong> utilizes autonomous inertial sensors combined with multi-constellation satellite tracking to detect impact instantly.
              </p>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                Within 3 seconds of impact, encrypted distress signals are broadcast to family members, traffic command, and the nearest ambulance fleet with exact map pins, ensuring life-saving intervention during the critical Golden Hour.
              </p>
            </div>

            <div className="lg:col-span-5 space-y-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <Radio size={16} />
                </div>
                <div>
                  <div className="font-bold text-white">ZERO WITNESS DEPENDENCY</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Detects crashes even when driver is unconscious</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="font-bold text-white">PRECISION FOREST LOCK</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Exact latitude/longitude sent to rescue teams</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center icon-center shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <div className="font-bold text-white">INSTANT FAMILY ALERTS</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Automated SMS with live map tracking link</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
