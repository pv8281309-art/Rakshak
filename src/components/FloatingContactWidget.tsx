import React from 'react';
import { Phone } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const FloatingContactWidget: React.FC = () => {
  const location = useLocation();

  // Hide on admin panel routes as requested
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div 
      className="fixed z-50 flex flex-col items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3 gap-2.5 transition-all"
      style={{ right: 'calc(2rem - 0.2cm)', bottom: 'calc(2rem - 0.3cm)' }}
    >
      
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919569994076"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center group cursor-pointer"
        title="Chat on WhatsApp"
      >
        <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          {/* Official WhatsApp Icon SVG */}
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.75 14.19c-.24.67-1.39 1.28-1.92 1.36-.49.07-1.11.11-3.58-.87-3.05-1.2-5.02-4.32-5.18-4.53-.16-.22-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.61-.38.81-.38.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.3.48-.15.17-.32.38-.45.51-.15.15-.31.31-.13.61.18.3 0.8 1.33 1.72 2.15 1.18 1.05 2.17 1.38 2.47 1.53.3.15.48.13.66-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.15.28.11 1.78.84 2.08.99.3.15.5.22.57.34.07.12.07.7-.17 1.37z"/>
          </svg>
        </div>
        <span className="text-[10px] font-bold text-slate-900 mt-1 whitespace-nowrap">
          Chat with us!
        </span>
      </a>

      {/* Divider */}
      <div className="w-6 h-px bg-slate-300" />

      {/* Call Button */}
      <a
        href="tel:+919569994076"
        className="flex flex-col items-center group cursor-pointer"
        title="Call Us"
      >
        <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <Phone size={18} className="fill-slate-950" />
        </div>
        <span className="text-[10px] font-bold text-slate-900 mt-1 whitespace-nowrap">
          Call us
        </span>
      </a>

    </div>
  );
};
