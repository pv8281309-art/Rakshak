import React, { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Radio, Users, Ambulance, Building2, ArrowRight, Play, Pause, RefreshCw, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export const EmergencyTimelineSection: React.FC = () => {
  const [activePhase, setActivePhase] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(12.4);

  const steps = [
    {
      id: 0,
      phase: 'PHASE 01',
      title: 'ACCIDENT DETECTED',
      shortDesc: 'Vehicle sensors detect collision inertia exceeding safety parameters.',
      detailedLog: 'High-speed deceleration anomaly registered by Rakshak 3.0 IMU accelerometer. Impact force exceeds 14.2G threshold. Automatic crash trigger initiated.',
      metricLabel: 'G-FORCE SENSOR',
      metricValue: '14.2G IMPACT',
      timeOffset: 'T + 0.0s',
      icon: AlertCircle,
      badgeColor: 'bg-red-500/10 border-red-500/30 text-red-500',
      accentColor: 'border-red-500 bg-red-500/10 text-red-400'
    },
    {
      id: 1,
      phase: 'PHASE 02',
      title: 'LOCATION CAPTURED',
      shortDesc: 'GPS locks onto precise highway coordinates and nearest milestone.',
      detailedLog: 'Multi-constellation GPS & GLONASS receiver locks onto exact coordinates with sub-meter precision. Altitude and vector heading computed.',
      metricLabel: 'GPS POSITION',
      metricValue: '28.6139° N, 77.2090° E',
      timeOffset: 'T + 0.4s',
      icon: MapPin,
      badgeColor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      accentColor: 'border-blue-500 bg-blue-500/10 text-blue-400'
    },
    {
      id: 2,
      phase: 'PHASE 03',
      title: 'EMERGENCY ALERT',
      shortDesc: 'Encrypted telemetry packet transmits securely to central command.',
      detailedLog: 'AES-256 encrypted emergency packet broadcasted via cellular 5G and satellite redundant uplinks to the Rakshak Emergency Cloud Hub.',
      metricLabel: 'PACKET ENCRYPTION',
      metricValue: 'AES-256 SECURE',
      timeOffset: 'T + 0.9s',
      icon: Radio,
      badgeColor: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      accentColor: 'border-amber-500 bg-amber-500/10 text-amber-400'
    },
    {
      id: 3,
      phase: 'PHASE 04',
      title: 'FAMILY NOTIFIED',
      shortDesc: 'Registered emergency contacts receive SMS alert with live location link.',
      detailedLog: 'Automated gateway dispatches SMS and WhatsApp alerts to pre-registered family members containing live Google Maps tracking and direct dial links.',
      metricLabel: 'CONTACTS NOTIFIED',
      metricValue: '3 RELATIVES ALERTED',
      timeOffset: 'T + 1.5s',
      icon: Users,
      badgeColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      accentColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
    },
    {
      id: 4,
      phase: 'PHASE 05',
      title: 'AMBULANCE ASSIGNED',
      shortDesc: 'Nearest emergency fleet unit is dispatched with route vectoring.',
      detailedLog: 'AI Dispatch Engine computes optimal corridor, routing ALS-04 ambulance unit with automated traffic signal synchronization.',
      metricLabel: 'FLEET UNIT ASSIGNED',
      metricValue: 'ALS-04 (ETA 04:12)',
      timeOffset: 'T + 2.2s',
      icon: Ambulance,
      badgeColor: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
      accentColor: 'border-orange-500 bg-orange-500/10 text-orange-400'
    },
    {
      id: 5,
      phase: 'PHASE 06',
      title: 'HOSPITAL ALERTED',
      shortDesc: 'Trauma ward is notified with pre-arrival medical profile and ETA.',
      detailedLog: 'Trauma Center emergency console receives live victim vitals, blood group, medical history, and estimated hospital arrival countdown.',
      metricLabel: 'TRAUMA BAY STATUS',
      metricValue: 'ICU BED #08 READY',
      timeOffset: 'T + 3.1s',
      icon: Building2,
      badgeColor: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      accentColor: 'border-purple-500 bg-purple-500/10 text-purple-400'
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev >= steps.length - 1 ? 0 : prev + 1));
      setCountdown((prev) => (prev <= 1.0 ? 15.0 : prev - 2.1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentStep = steps[activePhase];
  const CurrentIcon = currentStep.icon;

  return (
    <section id="timeline" className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white font-sans relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono font-bold tracking-widest text-slate-300 uppercase mb-4 shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>CHRONO-MATRIX TIMELINE PROTOCOL</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] uppercase">
            EVERY SECOND HAS A ROLE.<br />
            <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              SUB-SECOND EXECUTION.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed font-medium">
            Explore our automated 6-stage timeline protocol. Click any phase below to inspect live diagnostic telemetry and packet logs.
          </p>

          {/* Controller Bar */}
          <div className="mt-8 inline-flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-xl backdrop-blur-xl">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'PAUSE CHRONO' : 'PLAY CHRONO'}</span>
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Activity size={14} className="text-red-500 animate-pulse" />
              <span>ACTIVE PHASE: <strong className="text-white">0{activePhase + 1} / 06</strong></span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE CHRONO-MATRIX TIMELINE NAVIGATOR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activePhase === idx;
            return (
              <div
                key={step.id}
                onClick={() => {
                  setActivePhase(idx);
                  setIsPlaying(false);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between backdrop-blur-md group ${
                  isActive
                    ? 'bg-slate-800 border-red-500 shadow-lg shadow-red-500/20 scale-105'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {step.phase}
                  </span>
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${step.accentColor}`}>
                    <Icon size={16} />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight line-clamp-1">
                    {step.title}
                  </h4>
                  <div className="mt-1 text-[10px] font-mono text-slate-400">
                    {step.timeOffset}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DYNAMIC CHRONO-MATRIX DEEP DIVE PANEL */}
        <div className="bg-slate-950/90 border-2 border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left 7 cols: Detailed Info */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${currentStep.badgeColor}`}>
                  {currentStep.phase} · ACTIVE PROTOCOL
                </span>
                <span className="text-xs font-mono text-slate-400">
                  TIMESTAMP: {currentStep.timeOffset}
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                {currentStep.title}
              </h3>

              <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
                {currentStep.shortDesc}
              </p>

              <div className="mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-400 leading-relaxed">
                <div className="text-red-400 font-bold mb-1 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={14} />
                  <span>SYSTEM DIAGNOSTIC LOG:</span>
                </div>
                {currentStep.detailedLog}
              </div>
            </div>

            {/* Right 5 cols: Live Metric HUD */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    LIVE PROTOCOL METRIC
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="py-6 text-center">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                    {currentStep.metricLabel}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-2 tracking-tight">
                    {currentStep.metricValue}
                  </div>
                </div>

                <div className="space-y-2 font-mono text-xs border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>PROTOCOL LATENCY</span>
                    <span className="text-emerald-400 font-bold">&lt; 18ms</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>SECURITY STATE</span>
                    <span className="text-blue-400 font-bold">VERIFIED</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>AUTOMATION LEVEL</span>
                    <span className="text-red-400 font-bold">100% ZERO-DELAY</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>STAGE {activePhase + 1} OF 06</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>COMPLETED SUCCESSFULLY</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
