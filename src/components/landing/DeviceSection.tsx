import React from 'react';
import { Activity, Navigation, Radio, Battery, ShieldAlert, Cpu } from 'lucide-react';

export const DeviceSection: React.FC = () => {
  const specs = [
    {
      title: 'Tri-Axial Accelerometer',
      category: 'Motion & Impact',
      stat: '1000 Hz',
      icon: Activity
    },
    {
      title: 'High-Precision GNSS',
      category: 'Satellite Position',
      stat: 'Sub-Meter',
      icon: Navigation
    },
    {
      title: 'Cellular Emergency Uplink',
      category: 'Wireless Transmission',
      stat: '4G LTE',
      icon: Radio
    },
    {
      title: 'Emergency Power Reserve',
      category: 'Fail-Safe Battery',
      stat: '72-Hour',
      icon: Battery
    }
  ];

  return (
    <section id="device" className="py-12 bg-black text-white font-sans relative overflow-hidden border-y border-amber-500/20">
      
      {/* Yellow & Black Industrial Hazard Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/4 w-96 h-48 bg-yellow-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/15 border border-amber-500/40 text-xs font-mono font-bold tracking-widest text-amber-400 uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>SERIES 3.0 HARDWARE MODULES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-white">
              SENSOR UNIT SPECIFICATIONS
            </h2>
          </div>
          <div className="text-xs font-mono text-amber-400/80 bg-zinc-900 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Cpu size={14} className="text-amber-400" />
            <span>RUGGEDIZED IP67 INDUSTRIAL BUILD</span>
          </div>
        </div>

        {/* 4 Compact Yellow & Blackish Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <div 
                key={index}
                className="bg-zinc-950/90 border border-zinc-800 hover:border-amber-500 rounded-xl p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(245,158,11,0.2)] group relative overflow-hidden flex flex-col justify-between"
              >
                {/* Yellow accent stripe at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 shadow-sm">
                      <Icon size={22} />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                      {spec.stat}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    {spec.category}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase group-hover:text-amber-400 transition-colors">
                    {spec.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span className="text-amber-400/90 font-bold uppercase tracking-wider">Status: Nominal</span>
                  <span className="text-zinc-500">v3.0</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Summary Bar */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="border-r border-zinc-800 last:border-none">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">SAMPLING FREQUENCY</div>
            <div className="text-sm sm:text-base font-black text-amber-400 font-mono mt-0.5">1000 Hz</div>
          </div>
          <div className="border-r border-zinc-800 last:border-none">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">G-FORCE BUFFER</div>
            <div className="text-sm sm:text-base font-black text-amber-400 font-mono mt-0.5">±24G LIMIT</div>
          </div>
          <div className="border-r border-zinc-800 last:border-none">
            <div className="text-[10px] font-mono text-zinc-400 uppercase">UPLINK PROTOCOL</div>
            <div className="text-sm sm:text-base font-black text-amber-400 font-mono mt-0.5">4G LTE / GNSS</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">OPERATING VOLTAGE</div>
            <div className="text-sm sm:text-base font-black text-amber-400 font-mono mt-0.5">12V / 24V DC</div>
          </div>
        </div>

      </div>
    </section>
  );
};
