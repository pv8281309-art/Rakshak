import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Home, 
  AlertTriangle, 
  Navigation, 
  Bell, 
  Phone, 
  BookOpen, 
  User, 
  Settings,
  PlusSquare,
  LogOut,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SystemNoticeBanner } from '../components/SystemNoticeBanner';
import { UserPermissionModal } from '../components/common/UserPermissionModal';

export const UserLayout: React.FC = () => {
  const { clientSession, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate('/user/login');
  };

  const navItems = [
    { name: 'nav.dashboard', path: '/user/dashboard', icon: Home },
    { name: 'nav.report', path: '/user/report', icon: AlertTriangle, highlight: true },
    { name: 'nav.tracking', path: '/user/tracking', icon: Navigation },
    { name: 'nav.alerts', path: '/user/alerts', icon: Bell },
    { name: 'nav.contacts', path: '/user/contacts', icon: Phone },
    { name: 'nav.tutorials', path: '/user/tutorials', icon: BookOpen },
    { name: 'nav.hospitals', path: '/user/hospitals', icon: PlusSquare },
    { name: 'nav.settings', path: '/user/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-rakshak-midnight text-slate-100 flex flex-col font-sans overflow-hidden relative">
      <UserPermissionModal />
      <SystemNoticeBanner />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Background Dark Overlay & Pattern */}
        <div className="absolute inset-0 bg-[#020617]/95 z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0 pointer-events-none" />

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out flex flex-col bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800 text-slate-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="p-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1">
                <img src="/logo3.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xs font-black text-white tracking-tight uppercase block">OPERATION RAKSHAK</span>
                <span className="text-[10px] text-red-500 font-mono font-bold">USER TERMINAL</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all",
                    isActive 
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/30" 
                      : item.highlight 
                      ? "bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  <span>{t(item.name) || item.name}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut size={16} /> Logout Portal
            </button>
          </div>
        </aside>

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-y-auto">
          {/* Mobile Header */}
          <header className="lg:hidden glass-panel border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="text-slate-300 cursor-pointer">
                <Menu size={22} />
              </button>
              <span className="font-bold text-white text-sm">Operation Rakshak</span>
            </div>
          </header>

          <Outlet />
        </div>
      </div>
    </div>
  );
};
