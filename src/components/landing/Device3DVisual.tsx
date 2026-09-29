import React, { useState } from 'react';
import { Shield, Zap, Radio, Navigation, Activity } from 'lucide-react';

interface Device3DVisualProps {
  interactive?: boolean;
  showCallouts?: boolean;
  compact?: boolean;
}

export const Device3DVisual: React.FC<Device3DVisualProps> = ({
  interactive = true,
  showCallouts = true,
  compact = false
}) => {
  const [activeCallout, setActiveCallout] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const callouts = [
    {
      id: 'impact',
      label: 'IMPACT DETECTION',
      sub: 'Tri-axis 24G MEMS Accelerometer',
      x: '22%',
      y: '26%',
      color: '#DC2626',
      icon: Activity
    },
    {
      id: 'gps',
      label: 'GPS LOCATION',
      sub: 'Multi-constellation GNSS Receiver',
      x: '78%',
      y: '28%',
      color: '#2563EB',
      icon: Navigation
    },
    {
      id: 'alert',
      label: 'EMERGENCY ALERT',
      sub: 'Automated Instant Telemetry Dispatch',
      x: '18%',
      y: '72%',
      color: '#F59E0B',
      icon: Zap
    },
    {
      id: 'tracking',
      label: 'LIVE TRACKING',
      sub: 'Continuous Sub-second Corridor Link',
      x: '82%',
      y: '68%',
      color: '#16A34A',
      icon: Radio
    },
  ];

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200 }}
    >
      {/* Background subtle vehicle / road glow atmosphere */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full bg-slate-200/50 blur-3xl" />
        <div className="w-64 h-64 rounded-full bg-blue-100/40 blur-2xl -translate-x-12" />
      </div>

      {/* 3D Container with smooth transition */}
      <div
        className="relative transition-transform duration-300 ease-out flex items-center justify-center p-6 md:p-10"
        style={{
          transform: `rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Shadow plane */}
        <div 
          className="absolute bottom-6 w-3/4 h-12 bg-slate-900/15 rounded-full blur-xl -z-10"
          style={{ transform: 'translateZ(-40px) scale(1.1)' }}
        />

        {/* Industrial Device Casing */}
        <div 
          className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-1.5 shadow-2xl border border-slate-700/80"
          style={{ transform: 'translateZ(30px)' }}
        >
          {/* Outer Chamfer Rim */}
          <div className="relative rounded-[22px] bg-slate-900 p-5 md:p-6 border border-slate-800 shadow-inner overflow-hidden">
            
            {/* Fine carbon weave / subtle brushed metal texture */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
                backgroundSize: '16px 16px'
              }}
            />

            {/* Specular glare reflection */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar: Brand, Model & Status Array */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-xs">
                  <Shield size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-widest text-slate-400 font-semibold uppercase">
                    OPERATION RAKSHAK
                  </div>
                  <div className="text-xs font-black text-white tracking-wide">
                    SERIES 3.0 SENSOR UNIT
                  </div>
                </div>
              </div>

              {/* Status LEDs cluster */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 font-mono text-[10px]">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  PWR
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1 text-blue-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  GNSS
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                  LTE
                </span>
              </div>
            </div>

            {/* Core Telemetry Display / Sensor Dome */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-5 overflow-hidden">
              
              {/* Concentric Radar Grid */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-48 h-48 rounded-full border border-blue-400/40" />
                <div className="w-32 h-32 rounded-full border border-blue-400/30 absolute" />
                <div className="w-16 h-16 rounded-full border border-blue-400/20 absolute" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center py-3">
                {/* Central Crash Impact Core */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-red-500/40 flex items-center justify-center shadow-lg mb-3 group cursor-pointer">
                  <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping opacity-40" />
                  <Activity className="w-9 h-9 text-red-500 transition-transform group-hover:scale-110" />
                </div>

                <div className="text-[10px] font-mono tracking-widest text-red-400 font-bold uppercase">
                  ACTIVE IMPACT RECOGNITION
                </div>
                <div className="text-lg font-black text-white tracking-tight mt-0.5">
                  DUAL-CORE TELEMETRY MCU
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  High-frequency accelerometer sampling & sub-meter GNSS positioning engine
                </p>
              </div>

              {/* Hardware Spec Tags */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono">
                <div className="bg-slate-900/90 rounded-lg p-2 text-center border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">SAMPLING</span>
                  <span className="text-slate-200 font-bold block mt-0.5">1000 Hz</span>
                </div>
                <div className="bg-slate-900/90 rounded-lg p-2 text-center border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">G-FORCE</span>
                  <span className="text-slate-200 font-bold block mt-0.5">±24G BUFFER</span>
                </div>
                <div className="bg-slate-900/90 rounded-lg p-2 text-center border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">UPLINK</span>
                  <span className="text-emerald-400 font-bold block mt-0.5">4G LTE / SIM</span>
                </div>
              </div>
            </div>

            {/* Bottom Hardware Branding & Serial */}
            <div className="flex items-center justify-between mt-4 text-[10px] font-mono text-slate-400">
              <span>DESIGNED FOR VEHICULAR INTEGRATION</span>
              <span>DEV-HW-3.0-IND</span>
            </div>
          </div>
        </div>

        {/* Callout Pins Overlay */}
        {showCallouts && callouts.map((c) => {
          const Icon = c.icon;
          const isActive = activeCallout === c.id;
          return (
            <div
              key={c.id}
              className="absolute hidden sm:block pointer-events-auto"
              style={{
                left: c.x,
                top: c.y,
                transform: 'translate(-50%, -50%) translateZ(60px)'
              }}
              onMouseEnter={() => setActiveCallout(c.id)}
              onMouseLeave={() => setActiveCallout(null)}
            >
              {/* Callout Indicator Badge */}
              <div className="relative group cursor-pointer">
                <div 
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-md text-[11px] font-bold text-slate-900 flex items-center gap-1.5 transition-all hover:scale-105 hover:shadow-lg"
                  style={{ borderLeftColor: c.color, borderLeftWidth: 3 }}
                >
                  <Icon size={12} style={{ color: c.color }} />
                  <span className="tracking-wide font-sans">{c.label}</span>
                </div>

                {/* Extended Details Tooltip */}
                {isActive && (
                  <div 
                    className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white rounded-lg p-2.5 text-[11px] shadow-xl border border-slate-700 pointer-events-none"
                  >
                    <div className="font-bold text-slate-200">{c.label}</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">{c.sub}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Callout Summary List */}
      {showCallouts && (
        <div className="grid grid-cols-2 gap-2 mt-4 sm:hidden">
          {callouts.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs">
              <div className="text-[10px] font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.label}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
