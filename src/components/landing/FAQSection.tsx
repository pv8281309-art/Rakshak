import React, { useState } from 'react';
import { ChevronDown, Plus, Minus, Shield, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is Operation Rakshak 3.0?',
      a: 'Operation Rakshak 3.0 is an intelligent accident detection, prevention, and emergency response ecosystem. It bridges onboard vehicular hardware sensors with cloud infrastructure to instantly detect collisions, capture precise GPS coordinates, dispatch automated alerts, and coordinate response across emergency administrators, drivers, families, ambulances, and trauma hospitals.'
    },
    {
      q: 'How can we regenerate the password of the user and family dashboard?',
      a: 'For security compliance, user and family dashboard passwords cannot be reset via self-service links. Passwords can only be reset or regenerated directly from the central Admin Command Panel by an authorized regional administrator, or by visiting your nearest Operation Rakshak command center.'
    },
    {
      q: 'How does accident detection work?',
      a: 'The onboard sensor unit utilizes a high-frequency tri-axis MEMS accelerometer sampling vehicular motion at 1000 Hz. When deceleration forces exceed calibrated crash thresholds (up to 24G), an edge-processing algorithm analyzes the shock vector and angular velocity to differentiate legitimate collisions from rough terrain or sudden hard braking.'
    },
    {
      q: 'How is the accident location captured?',
      a: 'A dedicated multi-constellation GNSS (GPS) module continuously tracks the vehicle position. Upon confirmed crash detection, the latest sub-meter coordinate packet is locked and transmitted via the cellular emergency transceiver along with highway milestone and directional corridor data.'
    },
    {
      q: 'Who receives emergency alerts?',
      a: 'Emergency telemetry is immediately dispatched in parallel to: (1) Rakshak Central Administration Command, (2) the nearest accredited Trauma Center, (3) assigned emergency ambulance fleets, and (4) the driver’s registered family emergency contacts via SMS and web telemetry.'
    },
    {
      q: 'How does the family dashboard work?',
      a: 'Authorized family members log into the Family Portal to view the real-time status of their relative’s journey. During an emergency, the dashboard activates an incident view showing the exact crash location, dispatched ambulance status, estimated arrival time, and the receiving hospital details.'
    },
    {
      q: 'How does the hospital dashboard work?',
      a: 'The Hospital Command Center alerts emergency departments before the ambulance arrives. Trauma teams can review incoming patient medical profiles, estimated arrival times, collision impact severity (G-force), and pre-allocate emergency beds and ICU life-support units.'
    },
    {
      q: 'How does ambulance tracking work?',
      a: 'Ambulance tracking activates in real-time when an incident occurs and a trauma hospital or dispatch center dispatches an emergency unit. The map visualizes the live routing vector between the hospital base, the dispatched ambulance, and the crash site coordinates.'
    },
    {
      q: 'Can Rakshak connect to Firebase?',
      a: 'Yes. Operation Rakshak 3.0 is built with direct Firebase Firestore and Authentication integration for real-time document synchronization, role-based security rules, encrypted audit logs, and instant multi-device event propagation.'
    },
    {
      q: 'What happens if an accident is detected incorrectly?',
      a: 'The system employs a multi-tiered verification buffer: edge-level inertia filtering rejects minor bumps and road imperfections, and an audible vehicle countdown provides the driver an opportunity to cancel the alert if the vehicle is safely operable before emergency dispatch is triggered.'
    }
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section 
      id="faq" 
      className="py-24 text-white font-sans relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/back.png")' }}
    >
      
      {/* Dark overlay for contrast and theme consistency */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[3px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-xs font-mono font-bold tracking-widest text-red-400 uppercase mb-4 shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>QUESTIONS & ANSWERS · OPERATION RAKSHAK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight uppercase">
            FREQUENTLY ASKED <span className="text-red-500">QUESTIONS.</span>
          </h2>
          <p className="mt-4 text-base text-slate-300 font-normal max-w-2xl mx-auto">
            Essential information regarding Operation Rakshak 3.0 hardware, architecture, and emergency workflows.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden transition-all hover:border-slate-700 shadow-xl"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-base font-bold text-white flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 border-t border-slate-800/80 text-sm text-slate-300 leading-relaxed font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
