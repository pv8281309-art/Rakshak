import React, { useState, useEffect } from 'react';
import { AlertTriangle, Ambulance, Building2, MapPin, CheckCircle2, Clock, Play, RotateCcw } from 'lucide-react';

export const SimulationSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(2);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <section id="simulation" className="py-24 bg-[#F8FAFC]/75 backdrop-blur-xl border-b border-slate-200/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-red-600 uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span>LIVE RESPONSE SIMULATION</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
              INTERVENTION IN ACTION.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl font-normal">
              An interactive demonstration showing the automated sequence from collision detection to hospital admission.
            </p>
          </div>

          {/* Simulation Disclaimer Badge */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              DEMO DATA · SIMULATED EVENT
            </span>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title={isPlaying ? "Pause Demo" : "Play Demo"}
            >
              {isPlaying ? <Clock size={16} /> : <Play size={16} />}
            </button>
          </div>
        </div>

        {/* Simulation Dashboard Card (Light theme, clean presentation) */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT 7 COLS: Simulated Map Visualizer */}
          <div className="lg:col-span-7 bg-slate-900 relative p-6 min-h-[380px] sm:min-h-[460px] flex flex-col justify-between overflow-hidden">
            
            {/* Map Grid and Background styling */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Top Bar on Map */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-white text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>ACCIDENT DETECTED</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                GEO-VECTOR: 28.6139° N, 77.2090° E
              </div>
            </div>

            {/* Visual Vector Schematic: ACCIDENT -> AMBULANCE -> HOSPITAL */}
            <div className="relative z-10 my-auto py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2 max-w-xl mx-auto relative">
                
                {/* Connecting Path */}
                <div className="hidden sm:block absolute top-1/2 left-12 right-12 h-1 bg-slate-800 -translate-y-1/2 -z-0">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 transition-all duration-700"
                    style={{ width: activeStep === 1 ? '30%' : activeStep === 2 ? '70%' : '100%' }}
                  />
                </div>

                {/* Node 1: Accident Site */}
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-400 flex items-center justify-center shadow-xl animate-pulse">
                    <AlertTriangle size={24} />
                  </div>
                  <span className="text-xs font-bold text-white mt-2">Crash Site</span>
                  <span className="text-[10px] font-mono text-red-400">G-Force: 18.4G</span>
                </div>

                {/* Node 2: Dispatched Ambulance */}
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-orange-950/80 border-2 border-orange-500 text-orange-400 flex items-center justify-center shadow-xl">
                    <Ambulance size={24} />
                  </div>
                  <span className="text-xs font-bold text-white mt-2">Ambulance ALS-04</span>
                  <span className="text-[10px] font-mono text-orange-400">ETA: 04:18 Mins</span>
                </div>

                {/* Node 3: Receiving Hospital */}
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-xl">
                    <Building2 size={24} />
                  </div>
                  <span className="text-xs font-bold text-white mt-2">Trauma Bay</span>
                  <span className="text-[10px] font-mono text-emerald-400">ICU Bed #08 Ready</span>
                </div>

              </div>
            </div>

            {/* Bottom Route Trace Label */}
            <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] font-mono text-slate-400">
              <span>ROUTE: ACCIDENT → AMBULANCE → HOSPITAL</span>
              <span className="text-emerald-400 font-semibold">STATUS: CORRIDOR ACTIVE</span>
            </div>
          </div>

          {/* RIGHT 5 COLS: Telemetry Teleprinter Panel */}
          <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  TELEMETRY LOG STREAM
                </span>
                <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  CRITICAL
                </span>
              </div>

              {/* Status List */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs text-slate-600">STATUS</div>
                  <div className="text-xs font-mono font-black text-red-600">CRITICAL EVENT</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs text-slate-600">INCIDENT LOCATION</div>
                  <div className="text-xs font-mono font-bold text-slate-900">28.6139° N, 77.2090° E</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs text-slate-600">AMBULANCE</div>
                  <div className="text-xs font-mono font-bold text-orange-600 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>ASSIGNED (ALS-04)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs text-slate-600">ESTIMATED ARRIVAL (ETA)</div>
                  <div className="text-xs font-mono font-black text-blue-600">04:18 MINS</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs text-slate-600">FAMILY NOTIFICATION</div>
                  <div className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>NOTIFIED VIA SMS</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs text-slate-600">HOSPITAL RECEPTION</div>
                  <div className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>ALERTED & PREPARED</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>SIMULATED PROTOCOL</span>
              <span className="font-mono text-slate-700 font-bold">100% AUTOMATED</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
