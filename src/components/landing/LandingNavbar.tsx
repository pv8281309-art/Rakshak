import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Menu, X } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('HOME');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Navigation arranged in exact website order without FAQ in top panel
  const navItems = [
    { name: 'HOME', id: 'hero' },
    { name: 'ABOUT US', id: 'about-us' },
    { name: 'DEVICE', id: 'device' },
    { name: 'WHY IT MATTERS', id: 'problem' },
    { name: 'HOW IT WORKS', id: 'how-it-works' },
    { name: 'ROLES', id: 'roles' },
    { name: 'NETWORK', id: 'response-network' },
    { name: 'SIMULATION', id: 'simulation' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const scrollPos = window.scrollY + 220;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(navItems[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveTab(navItems[i].name);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string, tabName: string) => {
    setActiveTab(tabName);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-4 sm:top-5 left-0 right-0 z-50 px-4 sm:px-8 pointer-events-none font-sans">
      <div className="max-w-[1440px] mx-auto w-full pointer-events-auto">
        {/* Widened, Substantial Frosted Glass Capsule Bar */}
        <div
          className={`w-full rounded-full py-3.5 sm:py-4 px-5 sm:px-8 flex items-center justify-between transition-all duration-300 ${
            scrolled
              ? 'bg-gradient-to-r from-slate-200/85 via-slate-100/70 to-slate-200/85 backdrop-blur-2xl border-2 border-white/90 shadow-2xl shadow-slate-900/15'
              : 'bg-gradient-to-r from-slate-200/75 via-slate-100/60 to-slate-200/75 backdrop-blur-xl border-2 border-white/80 shadow-xl shadow-slate-900/10'
          }`}
        >
          {/* LEFT: Operation Rakshak 3.0 Brand Identity */}
          <button
            onClick={() => scrollTo('hero', 'HOME')}
            className="flex items-center gap-3 text-left group cursor-pointer shrink-0 focus:outline-none"
            title="Operation Rakshak 3.0"
          >
            {/* Signature Rakshak Shield Emblem */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden p-0.5">
              <img src="/logo3.png" alt="Operation Rakshak Logo" className="w-full h-full object-contain" />
            </div>

            {/* Official Stacked Typography */}
            <div className="flex flex-col text-left">
              <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-slate-700 uppercase leading-none">
                OPERATION
              </span>
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-950 uppercase leading-tight mt-0.5 flex items-center gap-2">
                <span className="bg-gradient-to-r from-slate-900 via-zinc-900 to-red-950 bg-clip-text text-transparent">RAKSHAK</span>
                <span className="text-[10px] sm:text-[11px] font-mono font-black text-white bg-gradient-to-r from-red-600 to-red-700 px-2 py-0.5 rounded-md shadow-sm border border-red-500/30">
                  3.0
                </span>
              </span>
            </div>
          </button>

          {/* CENTER: Navigation Links arranged in exact website order */}
          <nav className="hidden xl:flex items-center gap-1.5 2xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => scrollTo(item.id, item.name)}
                  className={`text-xs sm:text-[13px] font-bold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-black text-[#FFB800] px-4 sm:px-5 py-2 rounded-full shadow-md'
                      : 'text-slate-800 hover:text-black hover:bg-black/5 px-3 py-2 rounded-full'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: Login Action Button */}
          <div className="flex items-center gap-3">
            {/* Black Pill Button matching the reference style */}
            <button
              onClick={() => navigate('/login')}
              className="bg-black text-[#FFB800] hover:bg-slate-900 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <span>LOGIN TO RAKSHAK</span>
              <ArrowRight size={14} className="text-[#FFB800]" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Capsule */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-3 w-full bg-slate-900/95 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-5 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => scrollTo(item.id, item.name)}
                    className={`w-full text-left py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-[#FFB800] text-black font-black'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{item.name}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-black"></span>}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-700/60">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-3 rounded-full bg-[#FFB800] text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
              >
                <span>LOGIN TO RAKSHAK PLATFORM</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
