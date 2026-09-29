import React from 'react';
import { Mail, Phone, MapPin, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const LandingFooter = () => {
  return (
    <footer id="contact" className="bg-[#020617] border-t border-slate-800 pt-16 pb-8 px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden">
                <img src="/logo3.png" alt="Operation Rakshak Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold uppercase tracking-widest text-white leading-tight text-sm">
                  Operation<br/><span className="text-rakshak-orange text-lg">Rakshak 3.0</span>
                </h3>
              </div>
            </div>
            <p className="text-slate-400 mb-2 font-medium">Safer People. Stronger India.</p>
            <p className="text-sm text-slate-500 max-w-sm">
              "A technology-driven road-safety ecosystem for safer roads and stronger families."
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold tracking-wider text-sm uppercase mb-6">Contact Us</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Phone: +91 1800 123 4567</li>
              <li>Email: support@operationrakshak.in</li>
              <li>Location: New Delhi, India</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold tracking-wider text-sm uppercase mb-6">Quick Access</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><button onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Mission</button></li>
              <li><button onClick={() => document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Impact</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Operation Rakshak 3.2. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            
            <div className="flex items-center gap-2 border-l border-slate-800 pl-6">
              <span className="font-medium text-slate-400">Made for a Safer Bharat</span>
              <div className="flex w-6 h-1 shadow-sm rounded-full overflow-hidden">
                <div className="flex-1 bg-[#FF9933]"></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1 bg-[#138808]"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

