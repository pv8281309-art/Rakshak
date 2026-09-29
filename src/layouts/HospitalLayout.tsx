import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHospital } from '../contexts/HospitalContext';
import { 
  LayoutDashboard, 
  Users, 
  ListOrdered, 
  Ambulance, 
  BedDouble, 
  Droplet, 
  FileText, 
  Bell, 
  Radio, 
  BarChart3, 
  Building2, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SystemNoticeBanner } from '../components/SystemNoticeBanner';

export const HospitalLayout: React.FC = () => {
  const { signOut, clientSession } = useAuth();
  const { 
    hospitalId, 
    hospital, 
    incomingPatients, 
    alerts, 
    unreadAlertsCount, 
    unreadMessagesCount, 
    soundEnabled, 
    setSoundEnabled,
    lastTelemetryUpdate,
    markAlertRead
  } = useHospital();

  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Clock in IST
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/hospital/overview', icon: LayoutDashboard },
    { 
      name: 'Incoming Patients', 
      path: '/hospital/incoming', 
      icon: Users, 
      badge: incomingPatients.length > 0 ? incomingPatients.length : null,
      badgeColor: incomingPatients.some(p => p.severity === 'CRITICAL') ? 'bg-red-500' : 'bg-amber-500'
    },
    { name: 'Emergency Queue', path: '/hospital/queue', icon: ListOrdered },
    { name: 'Ambulance Tracking', path: '/hospital/ambulances', icon: Ambulance },
    { name: 'Bed Management', path: '/hospital/beds', icon: BedDouble },
    { name: 'Blood Bank', path: '/hospital/blood-bank', icon: Droplet },
    { name: 'Patient Records', path: '/hospital/patients', icon: FileText },
    { 
      name: 'Alerts & Notifications', 
      path: '/hospital/alerts', 
      icon: Bell, 
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
      badgeColor: 'bg-red-500'
    },
    { 
      name: 'Command Center', 
      path: '/hospital/command-center', 
      icon: Radio,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
      badgeColor: 'bg-cyan-500'
    },
    { name: 'Reports & Analytics', path: '/hospital/reports', icon: BarChart3 },
    { name: 'Facility Profile', path: '/hospital/profile', icon: Building2 },
    { name: 'Settings', path: '/hospital/settings', icon: Settings },
    { name: 'Help & Protocol', path: '/hospital/help', icon: HelpCircle },
  ];

  const criticalIncoming = incomingPatients.filter(p => p.severity === 'CRITICAL');

  const secondsSinceUpdate = lastTelemetryUpdate 
    ? Math.floor((Date.now() - lastTelemetryUpdate.getTime()) / 1000) 
    : null;
  const isTelemetryDelayed = secondsSinceUpdate !== null && secondsSinceUpdate > 60;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative text-slate-100 bg-rakshak-midnight selection:bg-cyan-500 selection:text-white">
      <SystemNoticeBanner />
      
      {/* Background Dark Overlay & Pattern */}
      <div className="absolute inset-0 bg-[#020617]/95 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0 pointer-events-none" />

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800 z-30">
        <div className="flex items-center gap-3">
          <button 
            id="hospital-mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                <img src="/logo3.png" alt="Operation Rakshak Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">OPERATION RAKSHAK</span>
            </div>
            <p className="text-[11px] text-cyan-400 font-mono truncate max-w-[180px]">
              {hospital?.hospitalName || hospitalId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "p-2 rounded-lg border text-xs transition-colors cursor-pointer",
              soundEnabled ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" : "border-slate-700 text-slate-400 bg-slate-800"
            )}
            title={soundEnabled ? "Audio Alerts Active" : "Audio Alerts Muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 relative text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* SIDEBAR NAVIGATION */}
        <aside className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1 shadow-md">
                  <img src="/logo3.png" alt="Operation Rakshak Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 block">Operation Rakshak</span>
                  <span className="text-sm font-bold text-white tracking-tight">Hospital Command</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live
              </span>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">FACILITY ID</span>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {hospitalId}
                </span>
              </div>
              <p className="text-xs font-bold text-white mt-1.5 truncate">
                {hospital?.hospitalName || 'Trauma Center'}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {hospital?.city ? `${hospital.city}, ${hospital.state || ''}` : 'Regional Node'}
              </p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                    isActive 
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-bold" 
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={cn("transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs", item.badgeColor)}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <LogOut size={16} className="text-red-400" />
              <span>Hospital Logout</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* DESKTOP HEADER */}
          <header className="hidden md:flex items-center justify-between h-16 px-6 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-xl z-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono font-bold text-slate-300">IST {currentTime}</span>
              </div>
              {isTelemetryDelayed && (
                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono rounded-lg flex items-center gap-1.5">
                  <Clock size={13} /> Telemetry Delayed ({secondsSinceUpdate}s)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  "p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 cursor-pointer",
                  soundEnabled ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" : "border-slate-700 text-slate-400 bg-slate-800"
                )}
                title={soundEnabled ? "Audio Alerts Active" : "Audio Alerts Muted"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="text-[11px] font-mono">{soundEnabled ? 'Audio ON' : 'Muted'}</span>
              </button>

              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 relative text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-700/60 bg-slate-800/40 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadAlertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                      {unreadAlertsCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  {hospitalId.slice(0, 4)}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-xs font-bold text-white block leading-tight truncate max-w-[130px]">
                    {clientSession?.name || 'Staff User'}
                  </span>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider block">
                    Authorized Staff
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* CRITICAL INCOMING ALERT BANNER */}
          {criticalIncoming.length > 0 && (
            <div className="bg-gradient-to-r from-red-950/90 via-red-900/80 to-red-950/90 border-b border-red-700/60 px-4 py-2.5 flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="font-bold text-red-200 uppercase tracking-wide">
                  CRITICAL INCOMING ALERT ({criticalIncoming.length}):
                </span>
                <span className="text-white font-medium truncate max-w-xl">
                  Ambulance {criticalIncoming[0].ambulanceId} en route with Critical Patient {criticalIncoming[0].patientId}. ETA: {criticalIncoming[0].eta}. Required: {criticalIncoming[0].requiredResources.join(', ')}.
                </span>
              </div>
              <button
                onClick={() => navigate('/hospital/incoming')}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-red-900/40 cursor-pointer"
              >
                <span>Prepare Bay</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* PAGE CONTENT OUTLET */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
