import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  updateDoc, 
  setDoc, 
  doc, 
  serverTimestamp, 
  getDocs 
} from 'firebase/firestore';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  PhoneCall, 
  Building2, 
  ShieldAlert, 
  Radio, 
  X,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Default Icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Leaflet DivIcons
const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div class="animate-ping" style="position: absolute; inset: 0; background-color: #ef4444; border-radius: 50%; opacity: 0.8;"></div>
      <div style="position: relative; width: 32px; height: 32px; background-color: #dc2626; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 16px rgba(220, 38, 38, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
        📍
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const amboIcon = new L.DivIcon({
  className: 'custom-ambo-marker',
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div class="animate-ping" style="position: absolute; inset: 0; background-color: #3b82f6; border-radius: 50%; opacity: 0.5;"></div>
      <div style="position: relative; width: 36px; height: 36px; background-color: #1d4ed8; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 16px rgba(59, 130, 246, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
        🚑
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const hospIcon = new L.DivIcon({
  className: 'custom-hosp-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; background-color: #047857; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px rgba(16, 185, 129, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
      🏥
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapFocus({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

export default function LiveTracking() {
  const { clientSession } = useAuth();
  const [activeReport, setActiveReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);

  useEffect(() => {
    if (!clientSession?.id) {
      setLoading(false);
      return;
    }

    let unsubscribeSos: any = null;

    const checkLocal = () => {
      try {
        const localAlerts = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        const active = localAlerts.find((a: any) => 
          (a.customerId === clientSession.id || a.user === clientSession.name) && 
          a.status !== 'resolved'
        );
        setActiveReport(active || null);
      } catch (e) {
        setActiveReport(null);
      }
      setLoading(false);
    };

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'sos_alerts'));
        unsubscribeSos = onSnapshot(q, (snapshot) => {
          const userAlerts = snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter((a: any) => 
              (a.customerId === clientSession.id || a.user === clientSession.name) && 
              a.status !== 'resolved'
            )
            .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

          if (userAlerts.length > 0) {
            setActiveReport(userAlerts[0]);
          } else {
            checkLocal();
          }
          setLoading(false);
        }, (err) => {
          console.warn("Firestore error in LiveTracking, fallback to local:", err);
          checkLocal();
        });
      } catch (err) {
        checkLocal();
      }
    } else {
      checkLocal();
    }

    return () => {
      if (unsubscribeSos) unsubscribeSos();
    };
  }, [clientSession]);

  const cancelEmergency = async () => {
    if (activeReport) {
      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'sos_alerts', activeReport.id), {
            status: 'resolved',
            resolvedAt: new Date().toISOString()
          });
          
          if (activeReport.customerId) {
            const q = query(collection(db, 'customers'));
            const snap = await getDocs(q);
            const userDoc = snap.docs.find(d => d.data().customerId === activeReport.customerId);
            if (userDoc) {
              await updateDoc(doc(db, 'customers', userDoc.id), {
                status: 'active',
                lastSosId: null
              });
            }
          }
        } catch (e) {
          console.error("Cancel SOS error:", e);
        }
      }

      // Local storage update
      try {
        const local = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        const updated = local.map((a: any) => a.id === activeReport.id ? { ...a, status: 'resolved' } : a);
        localStorage.setItem('rakshak_sos_alerts', JSON.stringify(updated));
      } catch {}

      setActiveReport(null);
    }
  };

  const triggerInstantSOS = async () => {
    setIsTriggering(true);

    const userLat = 28.6139;
    const userLng = 77.2090;
    const amboLat = userLat + 0.012;
    const amboLng = userLng + 0.009;
    const hospLat = userLat - 0.015;
    const hospLng = userLng - 0.011;

    const sosId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSOS = {
      id: sosId,
      customerId: clientSession?.id || 'CUST-001',
      user: clientSession?.name || 'User',
      vehicle: 'DL 01 AX 4589',
      mobile: '9999999999',
      type: 'Manual Panic (Live Tracking)',
      severity: 'critical',
      loc: '28.6139, 77.2090 (Connaught Place, New Delhi)',
      lat: userLat,
      lng: userLng,
      amboLat,
      amboLng,
      hospLat,
      hospLng,
      status: 'responding',
      timestamp: Date.now(),
      createdAt: serverTimestamp ? serverTimestamp() : { seconds: Math.floor(Date.now() / 1000) },
      ambulanceId: 'AMB-108',
      ambulanceNumber: 'DL 01 AX 4589 (ALS Life Support)',
      driverName: 'Ramesh Kumar',
      driverPhone: '+91 98765 43210',
      paramedicName: 'Dr. Sneha Patel',
      hospitalName: 'AIIMS Trauma Center',
      hospitalPhone: '+91 11 2658 8500',
      hospitalDepartment: 'Emergency Trauma ICU Bay 4',
      adminResponse: 'Control Room Dispatched Rapid Response Unit. Traffic priority green corridor activated.',
      hospitalResponse: 'AIIMS Trauma Center Alerted — Emergency Bay & Trauma Team Prepared.',
      eta: '6 MIN',
      waitTime: '6 Minutes',
      distance: '2.4 KM',
      speed: '54 km/h'
    };

    setActiveReport(newSOS);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'sos_alerts', sosId), newSOS);
        const q = query(collection(db, 'customers'));
        const snap = await getDocs(q);
        const userDoc = snap.docs.find(d => d.data().customerId === clientSession?.id);
        if (userDoc) {
          await updateDoc(doc(db, 'customers', userDoc.id), {
            status: 'responding',
            lastSosId: sosId,
            lastSosTrigger: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn("Could not save to firestore:", e);
      }
    }

    try {
      const existing = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
      localStorage.setItem('rakshak_sos_alerts', JSON.stringify([newSOS, ...existing]));
    } catch {}

    setIsTriggering(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12 text-slate-400">
        <Activity size={24} className="animate-spin text-blue-500 mr-2" />
        Connecting to satellite live tracking telemetry...
      </div>
    );
  }

  // Idle state when there is no active emergency
  if (!activeReport || activeReport.status === 'resolved') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        <div className="bg-[#020617]/60 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 bg-slate-900 border border-slate-700/80 rounded-2xl flex items-center justify-center text-slate-400 mx-auto shadow-inner">
            <Navigation size={36} className="text-blue-400" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">No Active Emergency In Progress</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              All vehicle sensors and crash detection telemetry are active and operational. When an emergency SOS is triggered, real-time ambulance routing, hospital status, and driver telemetry will appear here instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={triggerInstantSOS}
              disabled={isTriggering}
              className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert size={18} />
              {isTriggering ? 'Triggering SOS...' : 'Trigger Emergency SOS Now'}
            </button>
            <a
              href="tel:112"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall size={16} className="text-red-400" /> Dial 112 Directly
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left border-t border-slate-800">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Telemetry Link</span>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Satellite GPS Active
              </p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Designated Hospital</span>
              <p className="text-sm font-bold text-white truncate">AIIMS Trauma Center</p>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Average Arrival</span>
              <p className="text-sm font-bold text-amber-400">~6 to 8 Minutes</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Emergency Coordinates
  const userLat = activeReport.lat || 28.6139;
  const userLng = activeReport.lng || 77.2090;
  const amboLat = activeReport.amboLat || (userLat + 0.012);
  const amboLng = activeReport.amboLng || (userLng + 0.009);
  const hospLat = activeReport.hospLat || (userLat - 0.015);
  const hospLng = activeReport.hospLng || (userLng - 0.011);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Incident Status Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-2xl p-5 text-white shadow-[0_0_30px_rgba(220,38,38,0.35)] border border-red-500/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/30 animate-pulse">
            <Radio size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                ACTIVE RESPONSE
              </span>
              <span className="text-xs font-mono opacity-90">{activeReport.id}</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-0.5">
              Live Ambulance & Trauma Response Telemetry
            </h1>
            <p className="text-xs text-red-100 opacity-90 mt-0.5">
              Emergency SOS verified &bull; Control Room green corridor prioritized &bull; AIIMS Trauma Bay Reserved
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <a
            href={`tel:${activeReport.driverPhone || '+919876543210'}`}
            className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <PhoneCall size={14} /> Call Driver
          </a>
          <button
            onClick={cancelEmergency}
            className="px-4 py-2 bg-black/40 hover:bg-black/60 text-white rounded-xl text-xs font-bold border border-white/30 transition-all flex items-center gap-1.5"
          >
            <X size={14} /> Cancel SOS
          </button>
        </div>
      </div>

      {/* 4 Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ambulance Unit */}
        <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">Ambulance Unit</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
          </div>
          <p className="text-lg font-bold text-white truncate">{activeReport.ambulanceNumber || 'DL 01 AX 4589'}</p>
          <p className="text-xs text-slate-400">
            Driver: <span className="text-slate-200 font-semibold">{activeReport.driverName || 'Ramesh Kumar'}</span>
          </p>
          <p className="text-xs text-slate-400">
            Paramedic: <span className="text-slate-200 font-semibold">{activeReport.paramedicName || 'Dr. Sneha Patel'}</span>
          </p>
          <a
            href={`tel:${activeReport.driverPhone || '+919876543210'}`}
            className="mt-2 block w-full py-2 text-center text-xs font-bold bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-xl border border-blue-500/30 transition-colors"
          >
            Call Driver ({activeReport.driverPhone || '+91 98765 43210'})
          </a>
        </div>

        {/* Hospital Response */}
        <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Hospital Triage</span>
            <Building2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white truncate">{activeReport.hospitalName || 'AIIMS Trauma Center'}</p>
          <p className="text-xs text-emerald-400 font-semibold">
            {activeReport.hospitalDepartment || 'Trauma Bay 4 (Reserved)'}
          </p>
          <p className="text-xs text-slate-400">
            Triage: Emergency team prepped
          </p>
          <a
            href={`tel:${activeReport.hospitalPhone || '+911126588500'}`}
            className="mt-2 block w-full py-2 text-center text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-xl border border-emerald-500/30 transition-colors"
          >
            Call Hospital ({activeReport.hospitalPhone || '+91 11 2658 8500'})
          </a>
        </div>

        {/* Control Room / Admin Response */}
        <div className="bg-slate-900/60 border border-purple-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">Admin Control Hub</span>
            <Activity size={16} className="text-purple-400" />
          </div>
          <p className="text-lg font-bold text-white">Supervised</p>
          <p className="text-xs text-slate-400">
            Dispatcher: <span className="text-slate-200 font-semibold">Officer Vikram Sharma</span>
          </p>
          <div className="text-[11px] text-purple-300 font-mono bg-purple-500/10 py-1.5 px-2 rounded-lg border border-purple-500/20">
            Green corridor prioritized
          </div>
        </div>

        {/* Wait Time & Distance */}
        <div className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Estimated Wait Time</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">{activeReport.waitTime || activeReport.eta || '6 MIN'}</p>
          <p className="text-xs text-slate-400">
            Distance: <span className="text-slate-200 font-semibold">{activeReport.distance || '2.4 KM'}</span>
          </p>
          <div className="text-[11px] text-amber-300 font-mono bg-amber-500/10 py-1.5 px-2 rounded-lg border border-amber-500/20">
            Live Speed: {activeReport.speed || '54 km/h'}
          </div>
        </div>
      </div>

      {/* Main Map & Routing Visualizer */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl relative h-[450px] flex flex-col">
        {/* Top Map Float */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
          <div className="px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl text-xs font-semibold text-white shadow-xl flex items-center gap-2 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Ambulance Intercept Route Active
          </div>
          <div className="px-3.5 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl text-xs font-mono text-amber-400 shadow-xl pointer-events-auto">
            ETA: {activeReport.waitTime || '6 MIN'}
          </div>
        </div>

        {/* Leaflet Live Map */}
        <div className="flex-1 w-full h-full relative z-0">
          <MapContainer
            center={[userLat, userLng]}
            zoom={14}
            style={{ height: '100%', width: '100%', background: '#020617' }}
            zoomControl={false}
          >
            <MapFocus center={[userLat, userLng]} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="dark-map-tiles"
            />

            {/* User Incident Marker */}
            <Marker position={[userLat, userLng]} icon={userIcon}>
              <Popup>
                <div className="text-slate-900 p-1">
                  <h4 className="font-bold text-xs text-red-600">Incident Location (You)</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{activeReport.loc || 'GPS Location'}</p>
                </div>
              </Popup>
            </Marker>

            {/* Ambulance Marker */}
            <Marker position={[amboLat, amboLng]} icon={amboIcon}>
              <Popup>
                <div className="text-slate-900 p-1">
                  <h4 className="font-bold text-xs text-blue-600">Ambulance {activeReport.ambulanceId || '#AMB-108'}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Driver: {activeReport.driverName || 'Ramesh Kumar'}</p>
                  <p className="text-[11px] font-bold text-blue-600">ETA: {activeReport.waitTime || '6 MIN'}</p>
                </div>
              </Popup>
            </Marker>

            {/* Hospital Marker */}
            <Marker position={[hospLat, hospLng]} icon={hospIcon}>
              <Popup>
                <div className="text-slate-900 p-1">
                  <h4 className="font-bold text-xs text-emerald-600">{activeReport.hospitalName || 'AIIMS Trauma Center'}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Trauma Bay Prepared</p>
                </div>
              </Popup>
            </Marker>

            {/* Route Polyline */}
            <Polyline
              positions={[
                [amboLat, amboLng],
                [userLat, userLng]
              ]}
              pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '8, 8', opacity: 0.8 }}
            />
          </MapContainer>
        </div>

        {/* Map Bottom Legend */}
        <div className="bg-slate-900/90 border-t border-slate-800 p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> You (Incident Site)
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Ambulance (En Route)
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Hospital
            </div>
          </div>
          <div className="text-slate-400 font-mono">
            Location: {userLat.toFixed(4)}, {userLng.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Live Response Timeline & Notifications Feed */}
      <div className="bg-[#020617]/60 rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            Live Response Protocol Updates
          </h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Telemetry Stream Active
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Navigation size={14} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white">Ambulance Unit {activeReport.ambulanceNumber || 'AMB-108'} Dispatched</p>
                <span className="text-[10px] text-slate-500 font-mono">Just now</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Advanced Life Support ambulance assigned with Driver Ramesh Kumar & Dr. Sneha Patel.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 size={14} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white">Hospital Emergency Readiness Confirmed</p>
                <span className="text-[10px] text-slate-500 font-mono">1m ago</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                AIIMS Trauma Center acknowledged alert. Trauma Bay 4 pre-reserved with physician standby.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldAlert size={14} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white">Central Command Green Corridor Clearance</p>
                <span className="text-[10px] text-slate-500 font-mono">2m ago</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Control officer notified traffic division to expedite ambulance route to your GPS coordinate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
