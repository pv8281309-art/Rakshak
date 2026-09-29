import React from 'react';
import { 
  HelpCircle, 
  PhoneCall, 
  Radio, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  MessageSquare,
  LifeBuoy
} from 'lucide-react';

export const HospitalHelp: React.FC = () => {
  const faqs = [
    {
      q: 'How does an incoming emergency case appear on the Hospital Dashboard?',
      a: 'When an SOS alert is dispatched by the State Command Center or Admin and assigned to your facility ID, the emergency immediately appears on your dashboard via real-time Firebase listeners with an audio siren alert (if enabled).'
    },
    {
      q: 'How do I advance an incoming case through the triage workflow?',
      a: 'Go to Incoming Patients or Ambulance Tracking. As the ambulance approaches, click "Ambulance Arrived", then "Patient Handed Over", and finally "Admit to Hospital". Each transition updates state-wide telemetry.'
    },
    {
      q: 'Why does Bed Management require manual staff confirmation?',
      a: 'In accordance with hospital clinical safety standards, bed availability is never altered automatically by computer algorithms without human authorization. Staff click "Update Availability" to save counts.'
    },
    {
      q: 'What does "Telemetry delayed" indicate on the Ambulance Tracker?',
      a: 'If an ambulance’s GPS device has not transmitted a location packet in over 60 seconds (due to tunnel transit or network dead-zones), the system displays "Telemetry delayed (Last update: XX seconds ago)" to keep clinical staff accurately informed.'
    },
    {
      q: 'How can the hospital communicate with State Emergency Dispatch?',
      a: 'Open the "Command Center" tab to broadcast instant status presets (e.g. "Trauma Bay Ready") or send typed tactical messages directly to the central dispatch team.'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Standard Operating Procedures (SOP)
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Hospital Help & Tactical Support
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Operational protocols, workflow guidelines, and state dispatch escalation channels.
        </p>
      </div>

      {/* EMERGENCY CONTACT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">State Control Room (Hotline)</span>
          <div className="text-base font-bold text-white flex items-center gap-1.5 font-mono">
            <PhoneCall className="w-4 h-4 text-cyan-400" />
            <span>112 / 108</span>
          </div>
          <p className="text-[11px] text-slate-500">24/7 National Emergency Hotline</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Rakshak Dispatch Desk</span>
          <div className="text-base font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>+91 11 2950 0112</span>
          </div>
          <p className="text-[11px] text-slate-500">Direct Trauma Liaison Channel</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">IT & Telemetry Support</span>
          <div className="text-base font-bold text-purple-400 flex items-center gap-1.5 font-mono">
            <LifeBuoy className="w-4 h-4 text-purple-400" />
            <span>support@rakshak.gov.in</span>
          </div>
          <p className="text-[11px] text-slate-500">Technical infrastructure desk</p>
        </div>
      </div>

      {/* FAQS ACCORDION */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-1.5">
              <h3 className="text-xs font-bold text-white">{faq.q}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
