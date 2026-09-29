import React from 'react';
import { Check, Shield } from 'lucide-react';

export const WhyRakshakSection: React.FC = () => {
  const capabilities = [
    { title: 'Accident detection', detail: 'Onboard inertial sensors evaluate multi-axis crash deceleration vectors.' },
    { title: 'GPS-based location', detail: 'Sub-meter GNSS coordinate capture identifies precise expressway milestones.' },
    { title: 'Emergency alerts', detail: 'Automated telemetry transmission triggers immediately upon threshold breach.' },
    { title: 'Incident monitoring', detail: 'Real-time incident visualization and response queue for emergency dispatchers.' },
    { title: 'Family notifications', detail: 'Direct notification to authorized emergency contacts with incident location.' },
    { title: 'Ambulance coordination', detail: 'Route vectoring and ETA calculation between fleet units and incident coordinates.' },
    { title: 'Hospital notification', detail: 'Advance warning to trauma centers with patient details and expected arrival time.' },
    { title: 'Role-based access', detail: 'Dedicated interfaces tailored to administrators, drivers, families, and hospitals.' },
    { title: 'Centralized emergency management', detail: 'Unified platform synchronizing all response stakeholders into one coordinated workflow.' }
  ];

  return (
    <section className="py-24 bg-[#F8FAFC]/75 backdrop-blur-xl border-b border-slate-200/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-600 uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>PROVEN CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
            BUILT AROUND THE RESPONSE.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Every component in Operation Rakshak 3.0 is built to address verified communication bottlenecks in emergency response.
          </p>
        </div>

        {/* 9 Factual System Capabilities Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-xs flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {c.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
