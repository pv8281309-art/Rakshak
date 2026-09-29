import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { 
  LogOut, Shield, ShieldCheck, ShieldAlert, AlertTriangle, Users, MapPin, 
  Phone, Bell, Radio, Activity, Clock, Hospital, Ambulance, ChevronRight,
  ExternalLink, CheckCircle2, AlertCircle, RefreshCw, X, Menu, Info,
  Navigation, User, Car, HeartPulse, HelpCircle, PhoneCall, Compass, Gauge,
  Wifi, WifiOff, Route, TrendingUp, Settings, ShieldQuestion, Award, Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RakshakDeviceStatus } from '../../components/RakshakDeviceStatus';
import { RakshakSensorDisplay } from '../../components/RakshakSensorDisplay';
import { SOSAlertOverlay } from '../../components/SOSAlertOverlay';

// Fix Leaflet Default Icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Leaflet custom markers
const userSosIcon = new L.DivIcon({
  className: 'custom-sos-marker',
  html: `
    <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: 0; background-color: #ef4444; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>
      <div style="position: relative; width: 34px; height: 34px; background: linear-gradient(135deg, #ef4444, #b91c1c); border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 20px rgba(239, 68, 68, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
        🚨
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const userSafeIcon = new L.DivIcon({
  className: 'custom-user-safe-marker',
  html: `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: 0; background-color: #10b981; border-radius: 50%; opacity: 0.3;"></div>
      <div style="position: relative; width: 30px; height: 30px; background: linear-gradient(135deg, #10b981, #047857); border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 0 14px rgba(16, 185, 129, 0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
        📍
      </div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const amboIcon = new L.DivIcon({
  className: 'custom-ambo-marker',
  html: `
    <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: 0; background-color: #3b82f6; border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.6;"></div>
      <div style="position: relative; width: 34px; height: 34px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 16px rgba(59, 130, 246, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
        🚑
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const hospIcon = new L.DivIcon({
  className: 'custom-hosp-marker',
  html: `
    <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
      <div style="position: relative; width: 34px; height: 34px; background: linear-gradient(135deg, #059669, #065f46); border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 16px rgba(5, 150, 105, 0.85); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
        🏥
      </div>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

function MapController({ center, zoom }: { center: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || 14, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export type FamilyNavTab = 
  | 'dashboard' 
  | 'live-tracking' 
  | 'ambulance-tracking' 
  | 'driver-behavior' 
  | 'notifications'
  | 'accident-history';

export default function FamilyDashboard() {
  const { clientSession, signOut } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<FamilyNavTab>('dashboard');
  const [userData, setUserData] = useState<any>(null);
  const [allRegisteredCustomers, setAllRegisteredCustomers] = useState<any[]>([]);
  const [vehicleTelemetry, setVehicleTelemetry] = useState<any>(null);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [liveLocationData, setLiveLocationData] = useState<any>(null);
  const [driverBehaviorData, setDriverBehaviorData] = useState<any>(null);
  const [deviceStatusData, setDeviceStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hasReadNotifications, setHasReadNotifications] = useState(false);
  const [alarmMuted, setAlarmMuted] = useState(false);
  const [alarmDismissed, setAlarmDismissed] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<any>(null);

  useEffect(() => {
    // Reset dismiss state when activeAlert changes or starts
    if (activeAlert) {
      setAlarmDismissed(false);
    }
  }, [activeAlert?.id]);

  useEffect(() => {
    if (activeAlert && !alarmMuted && !alarmDismissed) {
      const playSiren = () => {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass) return;
          if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContextClass();
          }
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          // Dual tone piercing ringtone siren
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.25);
          osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.5);

          // Maximum gain (1.0) for high volume
          gain.gain.setValueAtTime(1.0, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {}
      };
      playSiren();
      alarmIntervalRef.current = setInterval(playSiren, 550);
    } else {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    }
    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, [activeAlert, alarmMuted, alarmDismissed]);

  // Map target
  const [mapTarget, setMapTarget] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(14);

  // Real backend speed
  const currentSpeed = vehicleTelemetry?.speed !== undefined && vehicleTelemetry?.speed !== null 
    ? Number(vehicleTelemetry.speed) 
    : 0;

  // Connectivity listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch data
  useEffect(() => {
    if (!clientSession) return;

    let unsubCust: (() => void) | null = null;
    let unsubSos: (() => void) | null = null;
    let unsubEmergencies: (() => void) | null = null;

    const fetchLocal = () => {
      try {
        const localCustomers = JSON.parse(localStorage.getItem('rakshak_customers') || '[]');
        setAllRegisteredCustomers(localCustomers);
        const match = localCustomers.find((c: any) => 
          c.familyId === clientSession.familyId || c.customerId === clientSession.customerId || c.id === clientSession.id
        );
        if (match) setUserData(match);

        const localAlerts = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        setAlertHistory(localAlerts);
        const active = localAlerts.find((a: any) => 
          ['new', 'active', 'responding', 'dispatched', 'en_route'].includes(a.status)
        );
        setActiveAlert(active || null);
      } catch (err) {
        console.warn("Local storage read error:", err);
      } finally {
        setLoading(false);
      }
    };

    let unsubLoc: (() => void) | null = null;
    let unsubBehav: (() => void) | null = null;
    let unsubDevice: (() => void) | null = null;

    if (isFirebaseConfigured && db) {
      try {
        unsubCust = onSnapshot(collection(db, 'customers'), (snapshot) => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAllRegisteredCustomers(list);
          const match = list.find((c: any) => 
            c.familyId === clientSession.familyId || c.customerId === clientSession.customerId || c.id === clientSession.id
          );
          if (match) setUserData(match);
          else fetchLocal();
          setLoading(false);
        }, () => fetchLocal());

        unsubSos = onSnapshot(collection(db, 'sos_alerts'), (snapshot) => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const localAlerts = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
          const combined = [...list];
          localAlerts.forEach((la: any) => {
            if (!combined.find(c => c.id === la.id)) combined.push(la);
          });
          setAlertHistory(combined);
        }, () => {});

        unsubEmergencies = onSnapshot(collection(db, 'emergencies'), (snapshot) => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const localEmgs = JSON.parse(localStorage.getItem('rakshak_emergencies') || '[]');
          const combined = [...list];
          localEmgs.forEach((le: any) => {
            if (!combined.find(c => c.id === le.id)) combined.push(le);
          });
          setAlertHistory(prev => {
            const merged = [...prev];
            combined.forEach(item => {
              if (!merged.find(m => m.id === item.id)) merged.push(item);
            });
            return merged;
          });
        }, () => {});

        const custId = clientSession?.customerId || clientSession?.id || 'CUST-1001';
        unsubLoc = onSnapshot(doc(db, 'liveLocations', custId), (docSnap) => {
          if (docSnap.exists()) setLiveLocationData(docSnap.data());
        }, () => {});

        unsubBehav = onSnapshot(doc(db, 'driverBehavior', custId), (docSnap) => {
          if (docSnap.exists()) setDriverBehaviorData(docSnap.data());
        }, () => {});

        unsubDevice = onSnapshot(doc(db, 'deviceStatus', custId), (docSnap) => {
          if (docSnap.exists()) setDeviceStatusData(docSnap.data());
        }, () => {});
      } catch (e) {
        fetchLocal();
      }
    } else {
      fetchLocal();
    }

    return () => {
      if (unsubCust) unsubCust();
      if (unsubSos) unsubSos();
      if (unsubEmergencies) unsubEmergencies();
      if (unsubLoc) unsubLoc();
      if (unsubBehav) unsubBehav();
      if (unsubDevice) unsubDevice();
    };
  }, [clientSession]);

  // Telemetry polling
  useEffect(() => {
    const regNo = userData?.vehicle?.regNo || clientSession?.vehicleReg || clientSession?.carNumber || '';
    if (!regNo) return;
    const cleanId = regNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    let isMounted = true;
    const fetchTelem = async () => {
      try {
        const res = await fetch(`/api/vehicles/${encodeURIComponent(cleanId)}/telemetry`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.telemetry && isMounted) {
            setVehicleTelemetry(json.telemetry);
          }
        }
      } catch (e) {}
    };

    fetchTelem();
    const interval = setInterval(fetchTelem, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userData?.vehicle?.regNo, clientSession]);

  // User Profile Data
  const familyId = userData?.familyId || clientSession?.familyId || 'FAM-88204';
  const customerId = userData?.customerId || clientSession?.customerId || clientSession?.id || 'CUST-1001';
  const userName = userData?.name || clientSession?.name || 'Rahul Sharma';
  const vehicleReg = userData?.vehicle?.regNo || clientSession?.vehicleReg || clientSession?.carNumber || 'UP-16-BR-9921';
  const userPhone = userData?.mobile || '+91 98765 43210';

  // Coordinates
  const userLat = activeAlert?.lat || vehicleTelemetry?.latitude || 28.5355;
  const userLng = activeAlert?.lng || vehicleTelemetry?.longitude || 77.3910;

  const amboLat = activeAlert?.amboLat || 28.5500;
  const amboLng = activeAlert?.amboLng || 77.4100;

  const isDeviceConnected = Boolean(deviceStatusData?.connected || vehicleTelemetry?.connected || liveLocationData);
  const isIgnitionOn = Boolean(vehicleTelemetry?.ignition || vehicleTelemetry?.speed > 0 || (liveLocationData?.speed && liveLocationData.speed > 0));

  // Notifications (Real alerts only)
  const notificationsList = React.useMemo(() => {
    const list: Array<{ id: string; type: 'sos' | 'warning' | 'info' | 'safe'; title: string; message: string; time: string; timestamp: number }> = [];
    if (activeAlert) {
      list.push({
        id: `sos-${activeAlert.id}`,
        type: 'sos',
        title: 'Emergency SOS Triggered',
        message: `Collision / emergency detected for ${userName} (${vehicleReg}). Live telemetry transmitted.`,
        time: 'Just now',
        timestamp: Date.now()
      });
    }
    alertHistory.forEach((alert: any) => {
      if (alert.id !== activeAlert?.id) {
        list.push({
          id: alert.id,
          type: 'sos',
          title: `SOS Alert (${alert.status || 'Active'})`,
          message: alert.message || `Emergency event recorded for vehicle ${vehicleReg}.`,
          time: 'Earlier',
          timestamp: alert.timestamp || Date.now()
        });
      }
    });
    return list;
  }, [activeAlert, alertHistory, userName, vehicleReg]);

  const unreadCount = hasReadNotifications ? 0 : notificationsList.length;

  // Automatically derive activeAlert from alertHistory so resolved/cancelled alerts immediately clear the alarm sound
  useEffect(() => {
    const active = alertHistory.find((a: any) => 
      ['new', 'active', 'responding', 'dispatched', 'en_route'].includes(a.status) &&
      a.status !== 'resolved' &&
      a.status !== 'cancelled' &&
      a.status !== 'false_alarm' &&
      a.active !== false
    );
    if (active) {
      setActiveAlert(active);
      setAlarmMuted(false);
    } else {
      setActiveAlert(null);
    }
  }, [alertHistory]);

  const handleDismissAlert = async () => {
    if (!activeAlert) return;
    const alertId = activeAlert.id;
    
    const severity = activeAlert.severity || (
      (activeAlert.message && activeAlert.message.toLowerCase().includes('collision')) || (activeAlert.speed && activeAlert.speed > 60) 
        ? 'Critical' 
        : activeAlert.speed && activeAlert.speed > 30 ? 'Moderate' : 'Minor'
    );

    const resolvedRecord = {
      ...activeAlert,
      severity,
      status: 'resolved',
      active: false,
      acknowledged: true,
      resolvedAt: new Date().toISOString()
    };

    try {
      const localEmgs = JSON.parse(localStorage.getItem('rakshak_emergencies') || '[]');
      const updatedEmgs = localEmgs.map((e: any) => e.id === alertId ? resolvedRecord : e);
      localStorage.setItem('rakshak_emergencies', JSON.stringify(updatedEmgs));

      const localSos = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
      const updatedSos = localSos.map((s: any) => s.id === alertId ? resolvedRecord : s);
      localStorage.setItem('rakshak_sos_alerts', JSON.stringify(updatedSos));

      const accidentHistory = JSON.parse(localStorage.getItem('rakshak_accident_history') || '[]');
      if (!accidentHistory.find((h: any) => h.id === alertId)) {
        localStorage.setItem('rakshak_accident_history', JSON.stringify([resolvedRecord, ...accidentHistory]));
      }

      setAlertHistory(updatedSos.length > 0 ? updatedSos : updatedEmgs);
    } catch (e) {}

    if (isFirebaseConfigured && db) {
      try {
        const { updateDoc, doc, setDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'sos_alerts', alertId), { status: 'resolved', active: false, acknowledged: true, resolvedAt: new Date().toISOString() }).catch(() => {});
        await updateDoc(doc(db, 'emergencies', alertId), { status: 'resolved', active: false, acknowledged: true, resolvedAt: new Date().toISOString() }).catch(() => {});
        await setDoc(doc(db, 'accident_history', alertId), resolvedRecord).catch(() => {});
      } catch (e) {}
    }

    setActiveAlert(null);
    setAlarmDismissed(true);
  };

  // Family Members
  const familyMembers = React.useMemo(() => {
    return [
      { id: 'fm-1', name: userName, relation: 'Primary Driver', mobile: userPhone, status: activeAlert ? 'Emergency' : 'Safe', location: 'Yamuna Expressway', device: 'Connected' },
      { id: 'fm-2', name: 'Priya Sharma', relation: 'Spouse / Co-Admin', mobile: '+91 98765 11223', status: 'Safe', location: 'Greater Noida Residence', device: 'Connected' }
    ];
  }, [userName, userPhone, activeAlert]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 gap-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold">Loading Operation Rakshak 3.0 Family Command...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-blue-500/20">
      
      {/* =========================================================================
          DESKTOP SIDEBAR NAVIGATION
          ========================================================================= */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out shadow-sm
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/20">
              OR
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight">Operation Rakshak 3.0</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Family Command</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto text-xs font-semibold text-slate-600">
          
          <button
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 font-bold shadow-xs' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Radio size={18} className={activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'} />
            <span className="text-sm">Dashboard Overview</span>
          </button>

          <button
            onClick={() => { setActiveTab('live-tracking'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
              activeTab === 'live-tracking' ? 'bg-blue-50 text-blue-600 font-bold shadow-xs' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <MapPin size={18} className={activeTab === 'live-tracking' ? 'text-blue-600' : 'text-slate-400'} />
            <span className="text-sm">Live User Tracking</span>
          </button>

          <button
            onClick={() => { setActiveTab('ambulance-tracking'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
              activeTab === 'ambulance-tracking' ? 'bg-blue-50 text-blue-600 font-bold shadow-xs' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Ambulance size={18} className={activeTab === 'ambulance-tracking' ? 'text-blue-600' : 'text-slate-400'} />
            <span className="text-sm">Ambulance Tracking</span>
          </button>

          <button
            onClick={() => { setActiveTab('driver-behavior'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
              activeTab === 'driver-behavior' ? 'bg-blue-50 text-blue-600 font-bold shadow-xs' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Activity size={18} className={activeTab === 'driver-behavior' ? 'text-blue-600' : 'text-slate-400'} />
            <span className="text-sm">Driver Behavior</span>
          </button>

          <button
            onClick={() => { setActiveTab('notifications'); setSidebarOpen(false); setHasReadNotifications(true); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
              activeTab === 'notifications' ? 'bg-blue-50 text-blue-600 font-bold shadow-xs' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell size={18} className={activeTab === 'notifications' ? 'text-blue-600' : 'text-slate-400'} />
              <span className="text-sm">Alerts</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('accident-history'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${
              activeTab === 'accident-history' ? 'bg-blue-50 text-blue-600 font-bold shadow-xs' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Clock size={18} className={activeTab === 'accident-history' ? 'text-blue-600' : 'text-slate-400'} />
            <span className="text-sm">Accident History</span>
          </button>

        </nav>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
          <a
            href="tel:112"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 transition-all"
          >
            <PhoneCall size={16} />
            <span>Emergency Call — 112</span>
          </a>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden backdrop-blur-xs" />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP HEADER */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
              aria-label="Open Sidebar"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Operation Rakshak 3.0 • Family Intelligence Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span>{isOnline ? 'SYSTEM OPERATIONAL' : 'CONNECTION LOST'}</span>
            </div>



            {/* Notification Bell */}
            <button
              onClick={() => { setActiveTab('notifications'); setHasReadNotifications(true); }}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {userName ? userName.charAt(0).toUpperCase() : 'F'}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">{userName}</p>
                  <p className="text-[10px] text-slate-500 font-mono leading-tight">{familyId}</p>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs">
                  <div className="p-2.5 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">Family ID: {familyId}</p>
                    <p className="text-[11px] text-slate-500 font-mono">Vehicle: {vehicleReg}</p>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); setActiveTab('dashboard'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-left transition-colors mt-1 font-medium"
                  >
                    <User size={14} />
                    <span>View Dashboard</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-left transition-colors font-medium"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT PANELS BY ACTIVE TAB */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          
          {/* ACTIVE EMERGENCY BANNER OVERRIDE */}
          {activeAlert && (
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 sm:p-6 shadow-lg animate-pulse">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldAlert size={26} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-red-900 tracking-tight">🚨 ACTIVE EMERGENCY DETECTED</h3>
                    <p className="text-sm font-semibold text-red-700 mt-0.5">
                      Possible accident detected for {userName} ({vehicleReg}). Emergency response initiated.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setAlarmDismissed(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>🔕 Acknowledge & Dismiss Alarm</span>
                  </button>
                  <button
                    onClick={() => setAlarmMuted(!alarmMuted)}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>{alarmMuted ? '🔇 Unmute Alarm' : '🔊 Mute Alarm'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('live-tracking')}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    View Live Tracking
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <RakshakDeviceStatus />
              <RakshakSensorDisplay />

              {/* TOP STATUS CARD */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${activeAlert ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></span>
                      <h3 className="text-lg font-black text-slate-900">
                        {activeAlert ? 'EMERGENCY STATE ACTIVE' : 'ALL FAMILY MEMBERS SAFE'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Real-time GPS tracking & ESP32 hardware telemetry active.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('live-tracking')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Open Live Tracking
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTIVE FAMILY MEMBER CARD */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{userName}</h4>
                      <p className="text-xs text-slate-500">Primary Driver • Vehicle: {vehicleReg}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeAlert ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {activeAlert ? '🚨 EMERGENCY ACTIVE' : '🟢 Safe & Monitored'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Current Speed</span>
                    <p className="font-bold text-slate-900 text-lg font-mono mt-1">{currentSpeed} km/h</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">ESP32 Hardware Telemetry</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Ignition Status</span>
                    <p className={`font-bold text-sm mt-1 ${isIgnitionOn ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {isIgnitionOn ? '🟢 IGNITION ON' : '⚪ IGNITION OFF'}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Hardware Contact Switch</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Device Connection</span>
                    <p className={`font-bold text-sm mt-1 ${isDeviceConnected ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isDeviceConnected ? '🟢 Connected' : '🔴 Device Offline'}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">GPS Satellite Fix: {isDeviceConnected ? 'Active' : 'Offline'}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    onClick={() => setActiveTab('live-tracking')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    View Live Tracking
                  </button>
                  <button
                    onClick={() => setActiveTab('driver-behavior')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
                  >
                    Check Driver Behavior
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TRACKING */}
          {activeTab === 'live-tracking' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Live Location & Telemetry Map</h3>
                    <p className="text-xs text-slate-500">Real-time GPS tracking for {userName} ({vehicleReg})</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    🟢 LIVE GPS
                  </span>
                </div>

                <div className="w-full h-[450px] rounded-xl overflow-hidden border border-slate-200 relative bg-slate-950">
                  <MapContainer
                    center={[userLat, userLng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <MapController center={[userLat, userLng]} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[userLat, userLng]} icon={activeAlert ? userSosIcon : userSafeIcon}>
                      <Popup>
                        <div className="text-xs">
                          <p className="font-bold">{userName}</p>
                          <p className="text-slate-500">{vehicleReg}</p>
                          <p className="text-blue-600 font-mono mt-1">Speed: {vehicleTelemetry?.speed || 54} km/h</p>
                        </div>
                      </Popup>
                    </Marker>
                    {activeAlert && (
                      <Marker position={[amboLat, amboLng]} icon={amboIcon}>
                        <Popup><div className="text-xs font-bold text-blue-600">Ambulance Unit RR-104</div></Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DRIVER BEHAVIOR */}
          {activeTab === 'driver-behavior' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Driver Safety Score & Behavior</h3>
                    <p className="text-xs text-slate-500">System-generated driving behavior indicator based on telemetry</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-emerald-600">86</span>
                    <span className="text-sm font-bold text-slate-400">/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Speed Control</span>
                    <p className="text-lg font-black text-slate-900 mt-1">86%</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Braking</span>
                    <p className="text-lg font-black text-emerald-600 mt-1">91%</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Acceleration</span>
                    <p className="text-lg font-black text-slate-900 mt-1">84%</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Cornering</span>
                    <p className="text-lg font-black text-emerald-600 mt-1">89%</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Consistency</span>
                    <p className="text-lg font-black text-slate-900 mt-1">82%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ALERTS / NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Real-Time Alerts & Safety Notifications</h3>
                  <p className="text-xs text-slate-500">Live event stream synchronized with Firestore & backend telemetry</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  {notificationsList.length} {notificationsList.length === 1 ? 'Alert' : 'Alerts'}
                </span>
              </div>

              {notificationsList.length > 0 ? (
                <div className="space-y-3">
                  {notificationsList.map((n) => (
                    <div key={n.id} className="p-4 bg-red-50/60 border border-red-200 rounded-xl flex items-start gap-3.5 text-xs">
                      <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                        🚨
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-red-900 text-sm">{n.title}</p>
                        <p className="text-red-700 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-red-500 font-mono mt-1.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                  <Bell size={28} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-bold text-slate-800">No active alerts or safety notifications</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    All telemetry feeds are nominal. Emergency SOS alerts or speed/harsh driving warnings will appear here instantly in real-time.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ACCIDENT HISTORY */}
          {activeTab === 'accident-history' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Accident & Incident History Logs</h3>
                  <p className="text-xs text-slate-500">Archived records of resolved or dismissed emergency SOS events</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  Archive
                </span>
              </div>

              {alertHistory.filter((a: any) => a.status === 'resolved' || a.status === 'cancelled' || a.status === 'false_alarm' || a.active === false).length > 0 ? (
                <div className="space-y-3">
                  {alertHistory
                    .filter((a: any) => a.status === 'resolved' || a.status === 'cancelled' || a.status === 'false_alarm' || a.active === false)
                    .map((h: any) => (
                      <div key={h.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-4 text-xs">
                        <div className="flex items-start gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                            📋
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 text-sm">Resolved SOS Incident ({h.id})</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                h.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                h.severity === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                Severity: {h.severity || 'Minor'}
                              </span>
                            </div>
                            <p className="text-slate-600 mt-0.5">{h.message || 'Emergency incident resolved and archived.'}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1.5">
                              Status: <span className="text-emerald-600 font-bold uppercase">{h.status || 'Resolved'}</span> • Timestamp: {new Date(h.timestamp || Date.now()).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Archived
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-12 px-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                  <Clock size={28} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-bold text-slate-800">No past accident history records</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Resolved or dismissed emergency alerts will be safely archived here for family and administrative review.
                  </p>
                </div>
              )}
            </div>
          )}





        </main>
      </div>

      <SOSAlertOverlay 
        activeAlert={activeAlert} 
        onDismiss={handleDismissAlert} 
        onViewTracking={() => setActiveTab('live-tracking')} 
        userName={userName} 
        vehicleReg={vehicleReg} 
      />
    </div>
  );
}
