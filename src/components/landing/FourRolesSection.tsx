import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, User, Users, Building2, ArrowRight, 
  Activity, Radio, Navigation, Cpu, PhoneCall, 
  UserCheck, BellRing, Clock, Bell, MapPin, 
  Building, AlertCircle, HeartPulse, ShieldCheck, Sparkles 
} from 'lucide-react';

export const FourRolesSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const handleRoleSelect = (roleKey: string) => {
    navigate(`/login?role=${roleKey}`);
  };

  const roles = [
    {
      key: 'admin',
      role: 'ADMIN',
      tagline: 'COMMAND THE RESPONSE',
      desc: 'Centralized command center operations & multi-agency dispatch coordination.',
      features: [
        { label: 'Incident monitoring', icon: Activity },
        { label: 'User management', icon: Users },
        { label: 'Emergency coordination', icon: Radio },
        { label: 'Ambulance coordination', icon: Navigation },
        { label: 'Hospital coordination', icon: Building2 }
      ],
      icon: Shield,
      btnText: 'ADMIN ACCESS',
      accent: 'border-slate-700 bg-slate-900/90 text-white hover:bg-slate-800',
      badge: 'border-slate-700 text-slate-300 bg-slate-800/80',
      glow: 'group-hover:border-slate-500 group-hover:shadow-[0_0_40px_rgba(148,163,184,0.25)]',
      bgImg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      revealText: 'Commander operations active with real-time vector routing and live telemetry feeds.'
    },
    {
      key: 'user',
      role: 'USER',
      tagline: 'YOUR EMERGENCY SYSTEM',
      desc: 'Automated personal safety node & intelligent crash telemetry.',
      features: [
        { label: 'Device status', icon: Cpu },
        { label: 'Emergency contacts', icon: PhoneCall },
        { label: 'Personal information', icon: UserCheck },
        { label: 'Incident status', icon: BellRing },
        { label: 'Emergency history', icon: Clock }
      ],
      icon: User,
      btnText: 'USER ACCESS',
      accent: 'border-blue-500 bg-blue-600 text-white hover:bg-blue-700',
      badge: 'border-blue-500/30 text-blue-400 bg-blue-950/60',
      glow: 'group-hover:border-blue-500/80 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]',
      bgImg: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=1200&q=80',
      revealText: 'Continuous sensor monitoring and sub-second crash detection activated.'
    },
    {
      key: 'family',
      role: 'FAMILY',
      tagline: 'STAY CONNECTED WHEN IT MATTERS',
      desc: 'Real-time guardian alerts & live trauma route tracking.',
      features: [
        { label: 'Emergency notifications', icon: Bell },
        { label: 'Incident location', icon: MapPin },
        { label: 'Live response status', icon: Activity },
        { label: 'Ambulance tracking', icon: Navigation },
        { label: 'Hospital information', icon: Building }
      ],
      icon: Users,
      btnText: 'FAMILY ACCESS',
      accent: 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700',
      badge: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/60',
      glow: 'group-hover:border-emerald-500/80 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]',
      bgImg: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
      revealText: 'Instant family notifications and live ambulance GPS tracking.'
    },
    {
      key: 'hospital',
      role: 'HOSPITAL',
      tagline: 'PREPARE BEFORE ARRIVAL',
      desc: 'Advanced triage data & ambulance stretcher telemetry feed.',
      features: [
        { label: 'Incoming alerts', icon: AlertCircle },
        { label: 'Patient information', icon: HeartPulse },
        { label: 'Incident location', icon: MapPin },
        { label: 'Ambulance status', icon: Navigation },
        { label: 'Emergency coordination', icon: ShieldCheck }
      ],
      icon: Building2,
      btnText: 'HOSPITAL ACCESS',
      accent: 'border-red-500 bg-red-600 text-white hover:bg-red-700',
      badge: 'border-red-500/30 text-red-400 bg-red-950/60',
      glow: 'group-hover:border-red-500/80 group-hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]',
      bgImg: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      revealText: 'Trauma bay pre-allocation and ambulance stretcher telemetry sync.'
    }
  ];

  return (
    <section id="roles" className="py-28 bg-[#090D16] text-white relative overflow-hidden font-sans border-b border-slate-800/80">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs font-mono font-bold tracking-widest text-blue-400 uppercase mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>ECOSYSTEM ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15] uppercase">
            ONE PLATFORM.<br />
            <span className="text-slate-400">FOUR CONNECTED ROLES.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Every emergency involves more than one person. Rakshak connects the people and systems responsible for detection, coordination, monitoring and response.
          </p>
        </motion.div>

        {/* Four Role Cards with Staggered Entrance Animation */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((r, idx) => {
            const Icon = r.icon;
            const isHovered = activeCard === r.key;
            return (
              <motion.div
                key={r.key}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                onMouseEnter={() => setActiveCard(r.key)}
                onMouseLeave={() => setActiveCard(null)}
                className={`group relative bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-7 border border-slate-800/90 transition-all duration-500 ease-out hover:-translate-y-3 hover:scale-[1.03] flex flex-col justify-between overflow-hidden shadow-2xl ${r.glow}`}
              >
                {/* Themed Faded Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity transition-transform duration-700 group-hover:scale-110 group-hover:opacity-35 pointer-events-none -z-10"
                  style={{ backgroundImage: `url('${r.bgImg}')` }}
                />

                {/* Gradient vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40 pointer-events-none -z-10" />

                <div>
                  {/* Top Bar with Icon and Role Tag */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                      <Icon size={22} />
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${r.badge}`}>
                      {r.role}
                    </span>
                  </div>

                  {/* Tagline & Description */}
                  <h3 className="text-lg font-black text-white tracking-tight uppercase leading-snug group-hover:text-blue-400 transition-colors">
                    {r.tagline}
                  </h3>
                  <p className="mt-2.5 text-xs text-slate-300 leading-relaxed font-normal">
                    {r.desc}
                  </p>

                  {/* Dynamic Revealing Info on Hover */}
                  <div className={`mt-4 pt-4 border-t border-slate-800 transition-all duration-500 overflow-hidden ${isHovered ? 'max-h-28 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] text-cyan-300 font-mono">
                      <Sparkles size={14} className="shrink-0 mt-0.5 text-amber-400" />
                      <span>{r.revealText}</span>
                    </div>
                  </div>

                  {/* Symbolic Feature Badges */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
                    {r.features.map((feat, fIdx) => {
                      const FeatIcon = feat.icon;
                      return (
                        <div 
                          key={fIdx}
                          title={feat.label}
                          className="w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm group/icon cursor-pointer relative"
                        >
                          <FeatIcon size={16} />
                          <span className="absolute bottom-full mb-1.5 hidden group-hover/icon:block px-2.5 py-1 bg-slate-950 text-white text-[10px] rounded-md shadow-xl whitespace-nowrap z-20 font-mono border border-slate-800">
                            {feat.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="mt-8 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => handleRoleSelect(r.key)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${r.accent}`}
                  >
                    <span>{r.btnText}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
