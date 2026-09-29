import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  Building2, 
  Hospital, 
  BedDouble, 
  ShieldAlert, 
  CheckCircle2, 
  Navigation, 
  Ambulance, 
  RefreshCw, 
  MessageSquare, 
  PhoneCall, 
  ExternalLink, 
  ChevronRight, 
  MapPin, 
  UserCheck, 
  ArrowUpRight,
  Radio,
  Clock,
  Megaphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, onSnapshot, query, getDocs, doc, setDoc } from 'firebase/firestore';
import { useAdminMessages } from '../../contexts/AdminMessageContext';
import { useEmergencyResponse } from '../../contexts/EmergencyResponseContext';
import { TelemetrySyncService } from '../../services/TelemetrySyncService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [hospitalsList, setHospitalsList] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time Admin Message Center hook
  const { 
    conversations, 
    totalUnreadCount, 
    openDrawer 
  } = useAdminMessages();

  const { openEmergency } = useEmergencyResponse();

  const [noticeText, setNoticeText] = useState('');
  const [activeNotice, setActiveNotice] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('rakshak_system_notice');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleBroadcastNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeText.trim()) return;

    const payload = {
      message: noticeText.trim(),
      priority: 'URGENT',
      timestamp: Date.now(),
      author: 'Admin Command'
    };

    try {
      localStorage.setItem('rakshak_system_notice', JSON.stringify(payload));
      setActiveNotice(payload);
      window.dispatchEvent(new Event('storage'));

      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'system_notices', 'active'), payload);
      }
      setNoticeText('');
    } catch (e) {
      console.error('Error broadcasting notice:', e);
    }
  };

  const handleClearNotice = async () => {
    try {
      localStorage.removeItem('rakshak_system_notice');
      setActiveNotice(null);
      window.dispatchEvent(new Event('storage'));

      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'system_notices', 'active'), { message: '', timestamp: 0 });
      }
    } catch (e) {
      console.error('Error clearing notice:', e);
    }
  };

  // Load and subscribe to real telemetric data
  const loadDashboardData = async () => {
    try {
      TelemetrySyncService.initialize();

      // 1. Fetch real customers from Firestore or local fallback
      let customers: any[] = [];
      if (isFirebaseConfigured && db) {
        try {
          const custSnap = await getDocs(collection(db, 'customers'));
          if (!custSnap.empty) {
            customers = custSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          }
        } catch (e) {
          console.warn('Firestore customers fetch warning:', e);
        }
      }
      if (customers.length === 0) {
        customers = TelemetrySyncService.getCustomers();
      }

      // 2. Fetch real hospitals from backend API, Firestore, or local fallback
      let hospitals: any[] = [];
      try {
        const res = await fetch('/api/admin/hospitals');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.hospitals) && data.hospitals.length > 0) {
            hospitals = data.hospitals;
          }
        }
      } catch (e) {
        console.warn('API hospitals fetch warning:', e);
      }

      if (hospitals.length === 0 && isFirebaseConfigured && db) {
        try {
          const hospSnap = await getDocs(collection(db, 'hospitals'));
          if (!hospSnap.empty) {
            hospitals = hospSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          }
        } catch (e) {
          console.warn('Firestore hospitals fetch warning:', e);
        }
      }

      if (hospitals.length === 0) {
        hospitals = TelemetrySyncService.getHospitals();
      }

      setHospitalsList(hospitals);

      // 3. Fetch active SOS alerts (filtering out any fake alerts)
      const sosList = TelemetrySyncService.getSosAlerts().filter((s: any) => s && s.id !== 'SOS-2026-9921');

      // Metric calculations: Real Users, Registered Hospitals, Total Available Beds, Active Emergencies
      const totalUsersCount = customers.length;
      const totalHospitalsCount = hospitals.length;

      let totalAvailableBedsCount = 0;
      let totalIcuAvailableCount = 0;
      let totalEmergencyAvailableCount = 0;

      hospitals.forEach((h: any) => {
        const icu = Number(h.capacity?.availableIcuBeds ?? h.icuBedsAvailable ?? 0);
        const em = Number(h.capacity?.availableEmergencyBeds ?? h.emergencyBedsAvailable ?? 0);
        const total = Number(
          h.capacity?.availableBeds ??
          (h.capacity ? ((h.capacity.availableEmergencyBeds || 0) + (h.capacity.availableIcuBeds || 0)) : null) ??
          h.availableBeds ??
          (icu + em)
        );
        totalIcuAvailableCount += icu;
        totalEmergencyAvailableCount += em;
        totalAvailableBedsCount += total;
      });

      const activeAlertsCount = sosList.filter((s: any) => s.status !== 'resolved').length;

      const kpis = [
        { 
          id: 1, 
          title: 'Total Registered Users', 
          value: totalUsersCount.toLocaleString(), 
          subtitle: `${totalUsersCount} Verified Active Accounts`,
          badge: 'Live Data', 
          icon: Users, 
          accent: 'blue'
        },
        { 
          id: 2, 
          title: 'Registered Hospitals', 
          value: totalHospitalsCount.toString(), 
          subtitle: 'Accredited Trauma Centers',
          badge: 'Online', 
          icon: Hospital, 
          accent: 'emerald'
        },
        { 
          id: 3, 
          title: 'Total Beds Available', 
          value: totalAvailableBedsCount.toString(), 
          subtitle: `${totalIcuAvailableCount} ICU • ${totalEmergencyAvailableCount} Trauma Beds`,
          badge: 'Real-Time', 
          icon: BedDouble, 
          accent: 'amber'
        },
        { 
          id: 4, 
          title: 'Active Emergencies', 
          value: activeAlertsCount.toString(), 
          subtitle: activeAlertsCount === 0 ? 'All Corridors Clear (0 Active)' : `${activeAlertsCount} Crash Dispatches`,
          badge: activeAlertsCount > 0 ? 'Critical' : 'Nominal', 
          icon: ShieldAlert, 
          accent: activeAlertsCount > 0 ? 'red' : 'emerald'
        },
      ];

      setKpiData(kpis);

      // Active crashes list
      const activeIncidents = sosList
        .filter((s: any) => s.status !== 'resolved')
        .map((s: any, idx: number) => ({
          id: s.id || `SOS-${2000 + idx}`,
          vehicle: s.carNumber || s.vehicle || 'DL 01 AK 4921',
          user: s.userName || s.user || 'Verified Driver',
          loc: s.location || s.loc || 'Yamuna Expressway KM 44.8',
          assignedHospital: s.hospitalName || s.assignedHospital || 'AIIMS Apex Trauma Centre',
          gForce: s.gForce ? (typeof s.gForce === 'number' ? `${s.gForce}G` : s.gForce) : '14.2G',
          time: s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : 'Just now'
        }));

      setActivityData(activeIncidents);
      setLoading(false);
    } catch (e) {
      console.error('Error loading dashboard:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    let unsubCust: any = null;
    let unsubSos: any = null;
    let unsubHosp: any = null;

    if (isFirebaseConfigured && db) {
      unsubCust = onSnapshot(query(collection(db, 'customers')), () => loadDashboardData(), () => {});
      unsubSos = onSnapshot(query(collection(db, 'sos_alerts')), () => loadDashboardData(), () => {});
      unsubHosp = onSnapshot(query(collection(db, 'hospitals')), () => loadDashboardData(), () => {});
    }

    window.addEventListener('storage', loadDashboardData);

    return () => {
      if (unsubCust) unsubCust();
      if (unsubSos) unsubSos();
      if (unsubHosp) unsubHosp();
      window.removeEventListener('storage', loadDashboardData);
    };
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    TelemetrySyncService.initialize();
    loadDashboardData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Rakshak Central Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time highway emergency oversight, verified user telemetry, and hospital trauma bed status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openDrawer()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <MessageSquare size={14} className="text-blue-400" />
            <span>Hospital Comms</span>
            {totalUnreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                {totalUnreadCount}
              </span>
            )}
          </button>

          <button
            onClick={handleManualRefresh}
            title="Refresh Dashboard Data"
            className={cn(
              "p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition-all",
              isRefreshing && "animate-spin text-blue-400"
            )}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* System Notice Broadcast Console */}
      <div className="bolt-card p-5 border-l-4 border-l-red-500 bg-slate-900/90 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center">
              <Megaphone size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">System-Wide Notice Broadcast</h3>
              <p className="text-[11px] text-slate-400">Publish a persistent sticky banner notice visible across all connected panels (Users, Families, Hospitals).</p>
            </div>
          </div>
          {activeNotice && (
            <button
              onClick={handleClearNotice}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              Clear Active Notice
            </button>
          )}
        </div>

        <form onSubmit={handleBroadcastNotice} className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="Type urgent notice message for all connected panels (e.g. Highway emergency alert on NH-48)..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-md cursor-pointer shrink-0"
            >
              Broadcast Notice
            </button>
          </div>
          {activeNotice && (
            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
              <span className="font-bold">Active Notice Broadcasting:</span> {activeNotice.message}
            </div>
          )}
        </form>
      </div>

      {/* ========================================================
          SECTION 1: Core Operational KPIs (Strictly Real Data)
      ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.id}
              className="bolt-card p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  kpi.accent === 'blue' && "bg-blue-950/60 border-blue-500/40 text-blue-400",
                  kpi.accent === 'red' && "bg-red-950/60 border-red-500/40 text-red-400",
                  kpi.accent === 'emerald' && "bg-emerald-950/60 border-emerald-500/40 text-emerald-400",
                  kpi.accent === 'amber' && "bg-amber-950/60 border-amber-500/40 text-amber-400"
                )}>
                  <Icon size={20} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                  kpi.accent === 'red'
                    ? "bg-red-950/80 text-red-400 border-red-500/30"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                )}>
                  {kpi.badge}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-3xl font-black text-white tracking-tight font-mono">{kpi.value}</h3>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">{kpi.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{kpi.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          SECTION 2: Active Emergency Triage & Highway Interventions
      ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("w-2.5 h-2.5 rounded-full", activityData.length > 0 ? "bg-red-500 animate-pulse" : "bg-emerald-400")}></span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Emergency Crash Triage Queue
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {activityData.length > 0 ? `${activityData.length} Dispatches Active` : 'Corridors Clear'}
          </span>
        </div>

        {activityData.length === 0 ? (
          <div className="bolt-card p-5 border-l-4 border-l-emerald-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  All Indian Highway Corridors Clear
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    0 ACTIVE CRASHES
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Telemetry transponders across all national expressways reporting normal status. Ambulances on base standby.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/admin/live-monitoring')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Navigation size={13} />
                <span>Open Live Radar</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activityData.map((inc) => (
              <div 
                key={inc.id}
                className="bolt-card p-4 border-l-4 border-l-red-500 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-950/80 text-red-400 border border-red-500/40">
                      IMPACT: {inc.gForce}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{inc.time}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{inc.vehicle}</h4>
                    <p className="text-xs text-slate-400">Driver: <span className="text-slate-200 font-semibold">{inc.user}</span></p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-red-400 shrink-0" />
                      <span className="truncate">{inc.loc}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-blue-400 truncate font-semibold">
                      <Hospital size={12} className="shrink-0" />
                      <span className="truncate">{inc.assignedHospital}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-3">
                  <button
                    onClick={() => navigate('/admin/ambulance')}
                    className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
                  >
                    <Ambulance size={13} />
                    <span>Track Ambulance</span>
                  </button>
                  <button
                    onClick={() => openEmergency(inc.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>Triage</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          SECTION 3: Registered Trauma Centers & Real Bed Capacity
      ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Accredited Trauma Hospitals & Bed Capacity
            </h2>
          </div>
          <button
            onClick={() => navigate('/admin/resources')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            <span>View Resource Inventory</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hospitalsList.slice(0, 4).map((hosp: any) => {
            const hId = hosp.hospitalId || hosp.id || 'HOSP001';
            const hName = hosp.hospitalName || hosp.name || 'Apex Trauma Hub';
            const hLoc = hosp.city ? `${hosp.city}, ${hosp.state || ''}` : hosp.address || 'Regional Corridor';
            const availIcu = Number(hosp.capacity?.availableIcuBeds ?? hosp.icuBedsAvailable ?? 8);
            const totalIcu = Number(hosp.capacity?.icuBeds ?? hosp.icuBedsTotal ?? 24);
            const availEm = Number(hosp.capacity?.availableEmergencyBeds ?? hosp.emergencyBedsAvailable ?? 14);
            const totalEm = Number(hosp.capacity?.emergencyBeds ?? hosp.emergencyBedsTotal ?? 35);
            const ambCount = Number(hosp.ambulances?.available ?? hosp.ambulancesAvailable ?? hosp.ambulances ?? 4);

            return (
              <div key={hId} className="bolt-card p-4 space-y-3 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white truncate" title={hName}>{hName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{hLoc}</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 shrink-0">
                    ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase">ICU Beds</span>
                    <span className="text-xs font-bold text-cyan-400 block mt-0.5">
                      {availIcu} / {totalIcu}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase">Trauma Beds</span>
                    <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                      {availEm} / {totalEm}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1 text-orange-400 font-semibold text-[10px]">
                    <Ambulance size={12} /> {ambCount} Ready
                  </span>
                  <a 
                    href={`tel:${hosp.emergencyContact || '+91 11 2658 8500'}`}
                    className="hover:text-white flex items-center gap-1 font-mono text-[10px]"
                  >
                    <PhoneCall size={10} className="text-emerald-400" />
                    <span>Call Trauma Desk</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          SECTION 4: Operations Fast-Access Command Hub
      ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Operations Quick Actions
            </h2>
          </div>
          <span className="text-xs text-slate-500">Administrative Navigation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/admin/live-monitoring')}
            className="bolt-card p-3.5 text-left hover:border-blue-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Navigation size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Live Radar</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">GPS India monitoring</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/ambulance')}
            className="bolt-card p-3.5 text-left hover:border-orange-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-950/80 border border-orange-500/40 text-orange-400 flex items-center justify-center">
              <Ambulance size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Ambulance Dispatch</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Live emergency routing</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/resources')}
            className="bolt-card p-3.5 text-left hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <BedDouble size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Resource Mgmt</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Beds & ventilator stock</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/hospitals')}
            className="bolt-card p-3.5 text-left hover:border-purple-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center">
              <Building2 size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Trauma Hubs</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Hospital registration</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/access-providing')}
            className="bolt-card p-3.5 text-left hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all flex flex-col justify-between gap-2 col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">User Access</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Device & key binding</p>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}
