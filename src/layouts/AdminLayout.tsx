import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle,
  Ambulance,
  FileText,
  Layers,
  Bell,
  BarChart2,
  Settings,
  ShieldCheck,
  Users,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Clock,
  Radio,
  Calendar,
  CheckCircle2,
  Building2,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot, query, doc, setDoc } from 'firebase/firestore';
import { AdminMessageProvider, useAdminMessages } from '../contexts/AdminMessageContext';
import { AdminMessageDrawer } from '../components/admin/AdminMessageDrawer';
import { AdminMessageToast } from '../components/admin/AdminMessageToast';
import { EmergencyResponseProvider, useEmergencyResponse } from '../contexts/EmergencyResponseContext';
import { EmergencyResponseDrawer } from '../components/admin/EmergencyResponseDrawer';
import { EmergencyAlertBanner } from '../components/admin/EmergencyAlertBanner';
import { SystemNoticeBanner } from '../components/SystemNoticeBanner';

const AdminMessagesHeaderButton: React.FC<{ mobile?: boolean }> = ({ mobile }) => {
  const { totalUnreadCount, openDrawer } = useAdminMessages();

  return (
    <button 
      onClick={() => openDrawer()}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 transition-all text-xs font-semibold shadow-sm ${
        mobile ? 'p-1.5' : ''
      }`}
      title="Hospital Comms"
    >
      <Radio size={14} className="text-indigo-600" />
      <span className="hidden sm:inline">Hospital Comms</span>
      {totalUnreadCount > 0 && (
        <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
          {totalUnreadCount}
        </span>
      )}
    </button>
  );
};

const AdminLayoutContent: React.FC = () => {
  const { adminUser, signOut, isMock } = useAuth();
  const { openEmergency } = useEmergencyResponse();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sosCount, setSosCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sosList, setSosList] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('rakshak_read_notifications') || '[]');
    } catch {
      return [];
    }
  });

  const markAllRead = () => {
    const allIds = Array.from(new Set([...readIds, ...sosList.map(s => s.id)]));
    setReadIds(allIds);
    try {
      localStorage.setItem('rakshak_read_notifications', JSON.stringify(allIds));
    } catch {}
    setSosCount(0);
  };

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem('rakshak_read_notifications', JSON.stringify(updated));
      } catch {}
      setSosCount(prev => Math.max(0, prev - 1));
    }
  };

  // Global SOS Listener for Header Bell (Unresolved & Latest Only)
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  useEffect(() => {
    const updateNotifCount = () => {
      try {
        const stored = localStorage.getItem('rakshak_admin_notifications');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            const unread = list.filter((n: any) => !n.read).length;
            setUnreadNotifCount(unread);
            return;
          }
        }
        setUnreadNotifCount(0);
      } catch {
        setUnreadNotifCount(0);
      }
    };

    updateNotifCount();
    window.addEventListener('storage', updateNotifCount);
    return () => window.removeEventListener('storage', updateNotifCount);
  }, []);

  React.useEffect(() => {
    let unsubscribe: any = null;

    const processAlerts = (rawList: any[]) => {
      // Strictly filter out resolved alerts and stale fake alerts
      const unresolved = rawList
        .filter((a: any) => a && a.status !== 'resolved' && a.id !== 'SOS-2026-9921')
        .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

      // Keep only the latest 8 alerts to prevent excessive memory/storage overhead
      const latestOnly = unresolved.slice(0, 8);
      
      const unreadAlerts = latestOnly.filter((a: any) => !readIds.includes(a.id) && (a.status === 'new' || a.status === 'responding'));

      setSosList(latestOnly);
      setSosCount(unreadAlerts.length);
    };
    
    const checkLocal = () => {
      try {
        const local = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        processAlerts(local);
      } catch (e) {}
    };

    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'sos_alerts'));
      unsubscribe = onSnapshot(q, (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        processAlerts(docs);
      }, () => {
        checkLocal();
      });
    } else {
      checkLocal();
      const interval = setInterval(checkLocal, 3000);
      return () => clearInterval(interval);
    }
    
    window.addEventListener('storage', checkLocal);
    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('storage', checkLocal);
    };
  }, [readIds]);

  const displayEmail = adminUser?.email || 'admin@rakshak.in';
  const displayName = adminUser?.displayName || (isMock ? 'Mock Admin' : 'Admin User');
  const displayInitials = isMock ? 'MA' : (adminUser?.displayName?.charAt(0) || 'A');
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('rakshak_admin_session_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');

  useEffect(() => {
    const isAdministrationRoute = location.pathname.includes('/admin/access-providing') || location.pathname.includes('/admin/hospitals');
    if (isAdministrationRoute) {
      if (!isAdminUnlocked) {
        setShowAdminPasswordModal(true);
        setAdminPasswordInput('');
        setAdminPasswordError('');
      } else {
        setAdminMenuOpen(true);
      }
    }
  }, [location.pathname, isAdminUnlocked]);

  const handleAdministrationClick = () => {
    if (isAdminUnlocked) {
      setAdminMenuOpen(!adminMenuOpen);
    } else {
      setShowAdminPasswordModal(true);
      setAdminPasswordInput('');
      setAdminPasswordError('');
    }
  };

  const handleLockAdminSession = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsAdminUnlocked(false);
    try {
      sessionStorage.removeItem('rakshak_admin_session_unlocked');
    } catch {}
    setAdminMenuOpen(false);
    if (location.pathname.includes('/admin/access-providing') || location.pathname.includes('/admin/hospitals')) {
      navigate('/admin/dashboard');
    }
  };

  const handleVerifyAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = adminPasswordInput.trim();
    if (cleanInput === '2769') {
      setIsAdminUnlocked(true);
      try {
        sessionStorage.setItem('rakshak_admin_session_unlocked', 'true');
      } catch {}
      setShowAdminPasswordModal(false);
      setAdminMenuOpen(true);
      setAdminPasswordError('');
    } else {
      setAdminPasswordError('Access Denied: Incorrect administrator password');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Live Monitoring', path: '/admin/live-monitoring', icon: Map },
    { name: 'SOS Notifications', path: '/admin/sos-notifications', icon: AlertTriangle, badge: sosCount > 0 ? sosCount : undefined },
    { name: 'Ambulance Tracking', path: '/admin/ambulance', icon: Ambulance },
    { name: 'User Reports', path: '/admin/user-reports', icon: FileText },
    { name: 'Resource Management', path: '/admin/resources', icon: Layers },
    { name: 'Error & Quota Monitor', path: '/admin/error-monitor', icon: ShieldAlert },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
    { name: 'Report and Analytics', path: '/admin/report-analytics', icon: BarChart2 },
    { name: 'Security & Threats', path: '/admin/system-health', icon: ShieldCheck },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleClearNotice = async () => {
    try {
      localStorage.removeItem('rakshak_system_notice');
      window.dispatchEvent(new Event('storage'));
      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'system_notices', 'active'), { message: '', timestamp: 0 });
      }
    } catch (e) {
      console.error('Error clearing notice:', e);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-[#080c16] text-slate-100 overflow-hidden relative font-sans bolt-bg"
    >
      <SystemNoticeBanner isAdmin onClearNotice={handleClearNotice} />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      {/* Mobile Header & Overlay */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0b101e]/95 backdrop-blur-xl border-b border-slate-800 shadow-md z-20 relative text-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shadow-sm flex items-center justify-center p-0.5">
            <img src="/logo3.png" alt="Operation Rakshak Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-white tracking-wider text-xs block">OPERATION RAKSHAK</span>
            <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Command Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminMessagesHeaderButton mobile />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-64 lg:w-72 z-[110] transform transition-transform duration-300 ease-in-out flex flex-col bg-[#0b101e]/95 backdrop-blur-2xl border-r border-slate-800/90 shadow-2xl md:shadow-none text-slate-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white md:hidden"
        >
          <X size={20} />
        </button>

        {/* Brand / Logo */}
        <div className="p-5 flex items-center gap-3.5 border-b border-slate-800/80 bg-[#0e1628]/60">
          <div className="w-12 h-12 relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-900 border border-slate-700 shadow-md p-1">
             <img src="/logo3.png" alt="Operation Rakshak Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-tight">OPERATION</span>
            <h1 className="font-black text-white tracking-tight leading-tight text-lg">RAKSHAK 3.0</h1>
            <span className="text-[11px] font-medium text-slate-400">Emergency & Trauma Net</span>
          </div>
        </div>

        {/* Section Heading: COMMAND CENTER + ONLINE */}
        <div className="px-5 pt-4 pb-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>COMMAND CENTER</span>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ONLINE
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            const isDashboard = item.name === 'Dashboard';
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative",
                  isActive 
                    ? isDashboard 
                      ? "bg-red-500/15 text-red-400 font-bold border-l-4 border-red-500 rounded-l-none shadow-xs"
                      : "bg-blue-600/20 text-blue-300 font-bold border-l-4 border-blue-500 rounded-l-none shadow-xs" 
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white border-l-4 border-transparent"
                )}
              >
                <Icon size={18} className={cn("transition-colors", isActive ? (isDashboard ? "text-red-400" : "text-blue-400") : "text-slate-400 group-hover:text-slate-200")} />
                <span className="tracking-wide flex-1">{item.name}</span>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Administration Collapsible Section */}
          <div className="pt-2">
            <div className="flex items-center gap-1">
              <button
                onClick={handleAdministrationClick}
                className={cn(
                  "flex items-center justify-between flex-1 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors group",
                  location.pathname.includes('/admin/access-providing') || location.pathname.includes('/admin/hospitals')
                    ? "bg-slate-800 text-white font-bold border-l-4 border-blue-500 rounded-l-none"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white border-l-4 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-slate-400 group-hover:text-slate-200" />
                  <span className="tracking-wide">Administration</span>
                </div>
                <div className="flex items-center gap-2">
                  {isAdminUnlocked ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30 flex items-center gap-1 uppercase tracking-wider">
                      <Lock size={9} /> Locked
                    </span>
                  )}
                  <ChevronRight size={15} className={cn("transition-transform duration-200 text-slate-400", adminMenuOpen ? "rotate-90 text-white" : "")} />
                </div>
              </button>
              {isAdminUnlocked && (
                <button
                  onClick={handleLockAdminSession}
                  title="Lock Administration Session"
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800/80 rounded-lg transition-colors shrink-0"
                >
                  <Lock size={14} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {adminMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pl-4 mt-1 space-y-1 border-l-2 border-slate-700 ml-4"
                >
                  <NavLink
                    to="/admin/access-providing"
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                      location.pathname === '/admin/access-providing' ? "text-white bg-slate-800 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    )}
                  >
                    <span>Access Provisioning</span>
                  </NavLink>
                  <NavLink
                    to="/admin/hospitals"
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                      location.pathname === '/admin/hospitals' ? "text-white bg-slate-800 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    )}
                  >
                    <span>Hospital Access</span>
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Bottom Skyline Illustration & User Card */}
        <div className="p-4 border-t border-slate-800/80 bg-[#080d1a]/70 space-y-3">
          {/* Watermark Graphic */}
          <div className="flex items-center gap-3 opacity-80">
            <svg className="w-8 h-8 text-blue-500/80 flex-shrink-0" viewBox="0 0 40 40" fill="none">
              <path d="M4 24H9L12 14L16 30L20 20L23 26H36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="text-[11px] font-bold text-slate-300 leading-tight">Faster Response</p>
              <p className="text-[11px] font-medium text-slate-500 leading-tight">Safer Tomorrow</p>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 shadow-sm">
            <div className="relative">
              <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                SA
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 absolute bottom-0 right-0"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">System Administrator</p>
              <p className="text-[11px] text-slate-400 truncate font-mono">admin@rakshak.gov.in</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10 bolt-bg">
        {/* Top Header */}
        <header className="h-16 bg-[#0a0f1d]/85 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-6 z-10 sticky top-0 hidden md:flex shadow-sm text-slate-100">
          <div className="flex-1 max-w-xl flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search Vehicle Reg, Telemetry ID, Trauma Center, Driver..." 
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-blue-500 focus:bg-slate-900 rounded-full py-2 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 shadow-xs"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-6">
            <div className="text-xs text-slate-300 font-medium hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-xs">
              <Calendar size={14} className="text-slate-400" />
              <span>{formattedDate}</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold font-mono tracking-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {formattedTime} IST
              </span>
            </div>
            
            {/* Hospital Messages Trigger Button */}
            <AdminMessagesHeaderButton />

            {/* SOS Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)} 
                className="relative p-2 rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700/80 bg-slate-900 shadow-xs"
              >
                <Bell size={16} />
                {sosCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                    {sosCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-96 bg-[#0f172a]/95 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-100">
                    <div className="p-3.5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
                      <div>
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                          <ShieldAlert size={16} className="text-red-500" />
                          Emergency SOS Alerts
                        </h3>
                        <p className="text-[11px] text-slate-400">Live telemetric emergency queue</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {sosCount > 0 && (
                          <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                            {sosCount} Critical
                          </span>
                        )}
                        {sosList.length > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                            className="text-[11px] text-blue-400 hover:underline font-bold"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                      {sosList.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-2 opacity-80" />
                          All highway emergency corridors clear
                        </div>
                      ) : (
                        sosList.map((sos: any) => {
                          const isUnread = !readIds.includes(sos.id) && sos.status === 'new';
                          return (
                            <div 
                              key={sos.id} 
                              onClick={() => { 
                                markAsRead(sos.id);
                                setNotificationsOpen(false); 
                                openEmergency(sos.id);
                              }} 
                              className={`p-3.5 hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3 relative ${
                                isUnread ? 'bg-red-950/40' : ''
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                                sos.status === 'responding' 
                                  ? 'bg-amber-950 text-amber-400 border border-amber-500/40' 
                                  : 'bg-red-950 text-red-400 border border-red-500/40'
                              }`}>
                                <ShieldAlert size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-xs font-bold text-white truncate">{sos.type || 'Crash SOS Event'}</p>
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                                    sos.status === 'responding' 
                                      ? 'bg-amber-900/60 text-amber-300 border border-amber-500/30' 
                                      : 'bg-red-900/60 text-red-300 border border-red-500/30'
                                  }`}>
                                    {sos.status || 'NEW'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 mt-0.5 truncate">{sos.user || 'Unknown'} • {sos.vehicle || 'Telemetry'}</p>
                                <p className="text-[10px] text-slate-400 mt-1 font-mono">{sos.loc || 'GPS Location'}</p>
                              </div>
                              {isUnread && (
                                <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-2 bg-slate-900 border-t border-slate-800 flex gap-2">
                      <button 
                        onClick={() => { setNotificationsOpen(false); navigate('/admin/live-monitoring'); }} 
                        className="flex-1 py-1.5 text-center text-xs font-bold text-blue-400 hover:bg-blue-900/30 rounded-xl transition-colors"
                      >
                        Live Map Radar
                      </button>
                      <button 
                        onClick={() => { setNotificationsOpen(false); navigate('/admin/sos-notifications'); }} 
                        className="flex-1 py-1.5 text-center text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        All SOS Logs
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="relative">
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
                className="flex items-center gap-2 p-1 rounded-full border border-slate-700/80 bg-slate-900 hover:bg-slate-800 transition-colors pl-1.5 pr-3 shadow-xs"
              >
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-xs">
                  {displayInitials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-200 leading-none">System Admin</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-700 bg-[#0f172a]/95 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all text-slate-100">
                    
                    {/* Header */}
                    <div className="p-4 flex items-center gap-3.5 bg-slate-900 border-b border-slate-800">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-lg font-black text-white shadow-md">
                        {displayInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{displayName}</h4>
                        <p className="text-[11px] text-blue-400 font-semibold">Chief Command Administrator</p>
                        <p className="text-xs text-slate-400 truncate font-mono">{displayEmail}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Level 1 Clearance</span>
                        </div>
                      </div>
                    </div>

                    {/* Logout */}
                    <div className="p-2">
                      <button 
                        onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-red-950/40 text-red-400 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-red-950/40 flex items-center justify-center text-red-400">
                            <LogOut size={15} />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-red-400">Logout Command</p>
                            <p className="text-[10px] text-red-300">End active session</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-red-400" />
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-900 px-4 py-2 text-right border-t border-slate-800">
                      <p className="text-[10px] font-bold tracking-wider text-slate-300 uppercase">Operation Rakshak 3.0</p>
                      <p className="text-[8px] tracking-wider text-slate-500 uppercase">Defense & Civil Highway Command</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Real-Time Emergency Notification & Action Banner */}
        <EmergencyAlertBanner />

        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 relative">
          {(location.pathname.includes('/admin/access-providing') || location.pathname.includes('/admin/hospitals')) && !isAdminUnlocked ? (
            <div className="flex flex-col items-center justify-center min-h-[450px] p-6">
              <div className="max-w-md w-full bg-[#0d1527] border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                  <Lock size={28} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Administration Session Locked</h2>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Access to Access Provisioning and Hospital Access requires administrative session authorization.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAdminPasswordModal(true);
                    setAdminPasswordInput('');
                    setAdminPasswordError('');
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                >
                  <KeyRound size={15} />
                  <span>Unlock Administration Session</span>
                </button>
              </div>
            </div>
          ) : (
            <Outlet />
          )}

          {/* Watermark at bottom right */}
          <div className="mt-8 mb-2 flex items-center justify-end gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider drop-shadow-sm select-none">
            <span>A SAFER INDIA TOGETHER</span>
            <span className="text-base">🇮🇳</span>
          </div>
        </div>
      </main>

      {/* Hospital Messaging Drawer & In-App Toast */}
      <AdminMessageDrawer />
      <AdminMessageToast />

      {/* Slide-Out Emergency Response Drawer */}
      <EmergencyResponseDrawer />

      {/* Administration Password Modal */}
      {showAdminPasswordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-slate-800"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Administration Security Gate</h3>
                <p className="text-xs text-slate-500">Enter authorization password to unlock administration session.</p>
              </div>
            </div>

            <form onSubmit={handleVerifyAdminPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Authorization Password
                </label>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminPasswordError('');
                  }}
                  placeholder="••••••••"
                  autoFocus
                  maxLength={15}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono tracking-widest text-center shadow-inner"
                />
                {adminPasswordError && (
                  <p className="text-xs text-red-600 mt-2 font-semibold flex items-center gap-1">
                    ⚠️ {adminPasswordError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPasswordModal(false);
                    if (location.pathname.includes('/admin/access-providing') || location.pathname.includes('/admin/hospitals')) {
                      navigate('/admin/dashboard');
                    }
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Unlock Session
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <EmergencyResponseProvider>
      <AdminMessageProvider>
        <AdminLayoutContent />
      </AdminMessageProvider>
    </EmergencyResponseProvider>
  );
};
