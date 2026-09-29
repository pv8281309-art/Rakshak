import React, { useEffect, useState } from 'react';
import { Shield, Activity, Users, BellRing, Smartphone, ShieldAlert, CheckCircle, Navigation, Network } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const HowItWorksSection = () => {
  const { isDark } = useTheme();

  const steps = [
    {
      num: '01',
      title: 'CONNECT',
      desc: 'Connect vehicles, users and safety systems to the centralized grid.',
      icon: Network
    },
    {
      num: '02',
      title: 'MONITOR',
      desc: 'Continuously monitor important safety parameters and journey status.',
      icon: Activity
    },
    {
      num: '03',
      title: 'DETECT & ALERT',
      desc: 'AI detects abnormal conditions and generates real-time alerts.',
      icon: BellRing
    },
    {
      num: '04',
      title: 'RESPOND & PROTECT',
      desc: 'Information reaches the right people and emergency response channels.',
      icon: ShieldCheck
    }
  ];

  return (
    <section id="mission" className={cn("py-24", isDark ? "bg-slate-900" : "bg-slate-50")}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className={cn("text-4xl font-bold mb-4", isDark ? "text-white" : "text-slate-900")}>How It Works</h2>
          <p className={cn("text-lg", isDark ? "text-slate-400" : "text-slate-600")}>
            A simple, integrated system for a safer tomorrow. Our platform connects directly with vehicles and smartphones to provide an umbrella of safety.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className={cn("hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5", isDark ? "bg-slate-800" : "bg-slate-200")}></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="flex flex-col items-center text-center relative group"
                >
                  <div className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-6 border-4 transition-all duration-300",
                    isDark 
                      ? "bg-[#020617] border-slate-800 text-slate-500 group-hover:border-rakshak-cyan group-hover:text-rakshak-cyan" 
                      : "bg-white border-slate-100 text-slate-400 shadow-sm group-hover:border-blue-500 group-hover:text-blue-500"
                  )}>
                    {step.num}
                  </div>
                  <h3 className={cn("text-lg font-bold mb-3 uppercase tracking-wider", isDark ? "text-white" : "text-slate-900")}>
                    {step.title}
                  </h3>
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export const FeaturesSection = () => {
  const { isDark } = useTheme();
  return (
    <section id="impact" className={cn("py-24 border-t", isDark ? "bg-[#060D1A] border-slate-800" : "bg-white border-slate-200")}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className={cn("text-4xl font-bold mb-4", isDark ? "text-white" : "text-slate-900")}>Our Impact</h2>
          <p className={cn("text-lg", isDark ? "text-slate-400" : "text-slate-600")}>
            Comprehensive tools designed to make Indian roads safer for everyone.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-50px" }}
             transition={{ duration: 0.5, delay: 0 }}
             className={cn("p-8 rounded-2xl border transition-all", isDark ? "bg-slate-900/50 border-slate-800 hover:border-blue-500/50" : "bg-slate-50 border-slate-200 hover:border-blue-500/50")}
           >
             <Shield className="text-blue-500 w-12 h-12 mb-6" />
             <h3 className={cn("text-xl font-bold mb-3", isDark ? "text-white" : "text-slate-900")}>Real-time Tracking</h3>
             <p className={cn("text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>Track vehicles and journeys in real-time with high precision using our integrated GPS and mobile app network.</p>
           </motion.div>
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-50px" }}
             transition={{ duration: 0.5, delay: 0.15 }}
             className={cn("p-8 rounded-2xl border transition-all", isDark ? "bg-slate-900/50 border-slate-800 hover:border-rakshak-orange/50" : "bg-slate-50 border-slate-200 hover:border-rakshak-orange/50")}
           >
             <BellRing className="text-rakshak-orange w-12 h-12 mb-6" />
             <h3 className={cn("text-xl font-bold mb-3", isDark ? "text-white" : "text-slate-900")}>Instant SOS</h3>
             <p className={cn("text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>One-tap emergency alerts that instantly notify nearby hospitals, police units, and emergency contacts.</p>
           </motion.div>
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-50px" }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className={cn("p-8 rounded-2xl border transition-all", isDark ? "bg-slate-900/50 border-slate-800 hover:border-rakshak-green/50" : "bg-slate-50 border-slate-200 hover:border-rakshak-green/50")}
           >
             <Users className="text-rakshak-green w-12 h-12 mb-6" />
             <h3 className={cn("text-xl font-bold mb-3", isDark ? "text-white" : "text-slate-900")}>Fleet Management</h3>
             <p className={cn("text-sm leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>Centralized dashboard for transport companies to monitor their entire fleet's safety metrics and route compliance.</p>
           </motion.div>
        </div>
      </div>
    </section>
  );
};

export const AboutSection = () => {
  const { isDark } = useTheme();
  return (
    <section id="about" className={cn("py-24 border-t", isDark ? "bg-slate-900" : "bg-slate-50 border-slate-200")}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-6 lg:px-8 text-center"
      >
        <h2 className={cn("text-4xl font-bold mb-6", isDark ? "text-white" : "text-slate-900")}>About Operation Rakshak</h2>
        <p className={cn("text-lg mb-6 leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
          Operation Rakshak 3.2 is a nationwide initiative aimed at drastically reducing road accidents and improving emergency response times across India.
        </p>
        <p className={cn("text-base mb-8 leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
          By leveraging modern technology, real-time data analytics, and a centralized command center, we connect drivers, emergency responders, and authorities on a single unified platform.
        </p>
        <ul className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mt-8">
           <motion.li 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4, delay: 0.2 }}
             className="flex items-center gap-2"
           >
             <CheckCircle className="text-rakshak-green w-5 h-5" />
             <span className={cn("font-medium", isDark ? "text-slate-300" : "text-slate-700")}>24/7 Monitoring Network</span>
           </motion.li>
           <motion.li 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4, delay: 0.3 }}
             className="flex items-center gap-2"
           >
             <CheckCircle className="text-rakshak-green w-5 h-5" />
             <span className={cn("font-medium", isDark ? "text-slate-300" : "text-slate-700")}>Integration with Authorities</span>
           </motion.li>
           <motion.li 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4, delay: 0.4 }}
             className="flex items-center gap-2"
           >
             <CheckCircle className="text-rakshak-green w-5 h-5" />
             <span className={cn("font-medium", isDark ? "text-slate-300" : "text-slate-700")}>AI Predictive Safety</span>
           </motion.li>
        </ul>
      </motion.div>
    </section>
  );
};

// Helper component for icon fallback
const ShieldCheck = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

