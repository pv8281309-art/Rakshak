import React from 'react';
import { BookOpen, ShieldAlert, Heart, Activity } from 'lucide-react';

export default function SafetyResources() {
  const tips = [
    { title: "First Aid Basics", desc: "Always keep a first-aid kit in your vehicle. Stop bleeding by applying direct pressure.", icon: Heart },
    { title: "Road Safety", desc: "Always wear seatbelts, follow speed limits, and never use your phone while driving.", icon: ShieldAlert },
    { title: "What to do after an accident", desc: "Ensure safety first. Move to the side if possible, turn on hazard lights, and use this app to trigger an SOS.", icon: Activity },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-blue-500" /> Safety Resources
        </h1>
        <p className="text-slate-400 mt-1">Information and guides to keep you safe.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip, idx) => (
          <div key={idx} className="bg-[#020617]/50 rounded-2xl border border-slate-800 p-6 flex gap-4 hover:bg-[#020617] transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <tip.icon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">{tip.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
