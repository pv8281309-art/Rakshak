import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300 font-sans py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 shadow-lg overflow-hidden shrink-0">
                <img src="/logo3.png" alt="Operation Rakshak Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                OPERATION RAKSHAK 3.0
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-medium">
              AI-Powered Accident Detection, Prevention & Emergency Response System
            </p>

            {/* Ultra-Stylish Animated Made by Bharat Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-950/80 via-slate-900 to-emerald-950/80 border border-orange-500/40 text-xs font-mono font-bold text-white shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
              <span className="text-base relative z-10">🇮🇳</span>
              <span className="bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent uppercase tracking-wider relative z-10 font-black">
                Proudly Made & Engineered in Bharat
              </span>
            </div>
          </div>

          {/* Col 2: Contact Admin & Support (Centered, No Boxes, Larger text & logos) */}
          <div className="space-y-5 flex flex-col items-center text-center">
            <h4 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-wider">
              CONTACT ADMIN & SUPPORT
            </h4>
            <div className="space-y-4 w-full flex flex-col items-center">
              <a 
                href="mailto:pv8281309@gmail.com"
                className="flex items-center gap-3 text-slate-300 hover:text-white transition-all group py-1"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Mail size={18} />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Official Support Email</div>
                  <div className="text-sm font-bold text-white font-mono">pv8281309@gmail.com</div>
                </div>
              </a>

              {/* Startup India Image Emblem (Larger, No Box) */}
              <div className="w-full max-w-[280px] pt-2">
                <img 
                  src="/startup-india.png" 
                  alt="Startup India" 
                  className="w-full h-28 object-contain brightness-110 filter drop-shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Col 3: Platform Access Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-wider">
              PLATFORM ACCESS
            </h4>
            <ul className="space-y-3 text-sm font-mono">
              <li>
                <button 
                  onClick={() => navigate('/login')} 
                  className="font-bold text-white hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Login to Rakshak
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/login?role=admin')} 
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 font-medium"
                >
                  Admin Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/login?role=user')} 
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 font-medium"
                >
                  User Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/login?role=family')} 
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 font-medium"
                >
                  Family Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/login?role=hospital')} 
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 font-medium"
                >
                  Hospital Terminal
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div>© 2026 Operation Rakshak 3.0. All rights reserved.</div>
          <div>All Emergency Telemetry Channels 256-Bit Encrypted</div>
        </div>

      </div>
    </footer>
  );
};
