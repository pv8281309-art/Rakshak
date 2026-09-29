import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { 
  doc, 
  getDocs, 
  collection, 
  query, 
  updateDoc, 
  setDoc, 
  serverTimestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  LogOut, 
  ShieldAlert, 
  Navigation, 
  Car, 
  Phone, 
  User, 
  MapPin, 
  Share2, 
  AlertTriangle, 
  X,
  Clock, 
  Activity, 
  Building2, 
  BellRing, 
  CheckCircle2,
  PhoneCall,
  Radio,
  ExternalLink,
  ChevronRight,
  Home as HomeIcon,
  HeartPulse,
  FileText,
  Settings as SettingsIcon,
  Users,
  Video,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { RakshakDeviceStatus } from '../../components/RakshakDeviceStatus';
import { RakshakSensorDisplay } from '../../components/RakshakSensorDisplay';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userMarkerIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div class="animate-ping" style="position: absolute; inset: 0; background-color: #ef4444; border-radius: 50%; opacity: 0.75;"></div>
      <div style="position: relative; width: 32px; height: 32px; background-color: #dc2626; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 16px rgba(220, 38, 38, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
        📍
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const amboMarkerIcon = new L.DivIcon({
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

const hospMarkerIcon = new L.DivIcon({
  className: 'custom-hosp-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; background-color: #047857; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px rgba(16, 185, 129, 0.9); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
      🏥
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

const NEARBY_HOSPITALS = [
  { name: 'AIIMS Trauma Center', distance: '2.4 km', eta: '6 mins', phone: '+91 11 2658 8500', type: 'Level 1 Trauma', beds: 14 },
  { name: 'Safdarjung Hospital', distance: '3.1 km', eta: '10 mins', phone: '+91 11 2616 5060', type: 'Govt. Hospital', beds: 8 },
  { name: 'Max Super Speciality', distance: '4.8 km', eta: '14 mins', phone: '+91 11 2651 5050', type: 'Private Emergency', beds: 22 }
];

export default function UserDashboard() {
  const { clientSession, signOut } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [allAlerts, setAllAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'live-tracking' | 'near-hospitals' | 'my-alerts' | 'emergency-contacts' | 'tele-rehab' | 'report-accident' | 'settings'>('home');

  // New Contact Form State
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactMobile, setNewContactMobile] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);

  // Manual Accident Report Form
  const [reportSeverity, setReportSeverity] = useState('Moderate');
  const [reportNotes, setReportNotes] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Real-time listener for user data and active SOS
  useEffect(() => {
    if (!clientSession?.id) {
      setLoading(false);
      return;
    }

    let unsubscribeCust: any = null;
    let unsubscribeSos: any = null;

    const setupListener = async () => {
      if (isFirebaseConfigured && db) {
        try {
          const qCust = query(collection(db, 'customers'));
          const snapshot = await getDocs(qCust);
          const matchingDoc = snapshot.docs.find(d => d.data().customerId === clientSession.id);
          
          if (matchingDoc) {
            setUserData({ id: matchingDoc.id, ...matchingDoc.data() });
            unsubscribeCust = onSnapshot(doc(db, 'customers', matchingDoc.id), (docSnap) => {
              if (docSnap.exists()) {
                setUserData({ id: docSnap.id, ...docSnap.data() });
              }
            });
          } else {
            loadLocalUser();
          }

          // Real-time listener on active SOS alerts
          const qSos = query(collection(db, 'sos_alerts'));
          unsubscribeSos = onSnapshot(qSos, (snap) => {
            const userAlerts = snap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter((a: any) => 
                (a.customerId === clientSession.id || a.user === clientSession.name)
              )
              .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

            setAllAlerts(userAlerts);
            const active = userAlerts.find((a: any) => a.status !== 'resolved');
            if (active) {
              setActiveAlert(active);
            } else {
              setActiveAlert(null);
            }
          });

        } catch (err) {
          console.warn("Firebase listener failed, using local", err);
          loadLocalUser();
          checkLocalAlert();
        }
      } else {
        loadLocalUser();
        checkLocalAlert();
      }
      setLoading(false);
    };

    const loadLocalUser = () => {
      try {
        const localData = JSON.parse(localStorage.getItem('rakshak_customers') || '[]');
        const user = localData.find((c: any) => c.customerId === clientSession.id);
        if (user) setUserData(user);
      } catch (e) {}
    };

    const checkLocalAlert = () => {
      try {
        const localAlerts = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        const userAlerts = localAlerts.filter((a: any) => 
          (a.customerId === clientSession.id || a.user === clientSession.name)
        );
        setAllAlerts(userAlerts);
        const active = userAlerts.find((a: any) => a.status !== 'resolved');
        setActiveAlert(active || null);
      } catch (e) {
        setActiveAlert(null);
      }
    };

    setupListener();

    return () => {
      if (unsubscribeCust) unsubscribeCust();
      if (unsubscribeSos) unsubscribeSos();
    };
  }, [clientSession]);

  const cancelSOS = async () => {
    if (userData && userData.id) {
      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'customers', userData.id), {
            status: 'active',
            lastSosId: null
          });
          
          if (activeAlert?.id) {
            await updateDoc(doc(db, 'sos_alerts', activeAlert.id), {
              status: 'resolved',
              resolvedAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.error("Cancel SOS failed", e);
        }
      }

      // Update local storage
      try {
        const existing = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        const updated = existing.map((a: any) => 
          (a.id === activeAlert?.id || a.customerId === clientSession?.id) 
            ? { ...a, status: 'resolved' } 
            : a
        );
        localStorage.setItem('rakshak_sos_alerts', JSON.stringify(updated));
      } catch {}

      setActiveAlert(null);
      setUserData((prev: any) => prev ? { ...prev, status: 'active', lastSosId: null } : null);
    }
  };

  const triggerSOS = async () => {
    setIsTriggering(true);

    const fireSos = async (lat: number, lng: number) => {
      const userLat = lat !== 0 ? lat : 28.6139;
      const userLng = lng !== 0 ? lng : 77.2090;
      const amboLat = userLat + 0.012;
      const amboLng = userLng + 0.009;
      const hospLat = userLat - 0.015;
      const hospLng = userLng - 0.011;

      const sosId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;

      const newSOS = {
        id: sosId,
        customerId: userData?.customerId || clientSession?.id || 'CUST-001',
        user: userData?.name || clientSession?.name || 'User',
        mobile: userData?.mobile || '+91 98765 43210',
        vehicleReg: userData?.vehicle?.regNo || 'DL 01 AX 4589',
        vehicleModel: userData?.vehicle?.model || 'Tata Nexon EV',
        lat: userLat,
        lng: userLng,
        amboLat,
        amboLng,
        hospLat,
        hospLng,
        status: 'responding',
        timestamp: Date.now(),
        eta: '6 mins',
        waitTime: '6 MIN',
        distance: '2.4 km',
        speed: '48',
        ambulanceId: 'AMB-108',
        ambulanceNumber: 'DL 01 V 9982',
        driverName: 'Ramesh Kumar',
        driverPhone: '+91 98991 23456',
        hospitalName: 'AIIMS Trauma Center',
        hospitalPhone: '+91 11 2658 8500',
        hospitalAcknowledged: true,
        loc: 'Outer Ring Road, Near Safdarjung Enclave, New Delhi'
      };

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'sos_alerts', sosId), newSOS);
          if (userData?.id) {
            await updateDoc(doc(db, 'customers', userData.id), {
              status: 'responding',
              lastSosId: sosId,
              lastSosTrigger: new Date().toISOString()
            });
          }
        } catch (e) {
          console.warn("Could not save to firestore:", e);
        }
      }

      // Local Sync
      try {
        const existing = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
        localStorage.setItem('rakshak_sos_alerts', JSON.stringify([newSOS, ...existing]));
      } catch {}

      setIsTriggering(false);
      setActiveTab('live-tracking');
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fireSos(pos.coords.latitude, pos.coords.longitude),
        () => fireSos(0, 0),
        { timeout: 4000, maximumAge: 10000 }
      );
    } else {
      fireSos(0, 0);
    }
  };

  const handleShareGPSWhatsApp = () => {
    const lat = activeAlert?.lat || 28.6139;
    const lng = activeAlert?.lng || 77.2090;
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const vehicleInfo = `${userData?.vehicle?.model || 'Vehicle'} (${userData?.vehicle?.regNo || 'DL 01 AX 4589'})`;
    const message = `🚨 *RAKSHAK EMERGENCY GPS SHARE* 🚨\n\nHello Family, my live GPS location & vehicle telemetry details:\n\n🚗 Vehicle: ${vehicleInfo}\n📍 Coordinates: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}\n🗺️ Live Map: ${mapsUrl}\n\nPlease check on me immediately!`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactMobile) return;

    const newContact = {
      name: newContactName,
      relation: newContactRelation || 'Family',
      mobile: newContactMobile
    };

    const updatedContacts = [...(userData?.emergencyContacts || []), newContact];

    if (userData?.id && isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'customers', userData.id), {
          emergencyContacts: updatedContacts
        });
      } catch (e) {
        console.warn("Failed updating contacts in firestore", e);
      }
    }

    setUserData((prev: any) => ({ ...prev, emergencyContacts: updatedContacts }));
    setNewContactName('');
    setNewContactRelation('');
    setNewContactMobile('');
    setShowAddContact(false);
  };

  const handleManualReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    triggerSOS();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-orange-50 text-slate-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-12 pointer-events-none bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2000&q=80')` }} />
        <div className="relative z-10 bg-white/80 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-xl border border-amber-200 text-sm font-semibold">
          Loading user dashboard telemetry...
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-orange-50 text-slate-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-12 pointer-events-none bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2000&q=80')` }} />
        <div className="relative z-10 bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-amber-200 text-center space-y-4 max-w-sm">
          <h1 className="text-xl font-bold text-slate-900">User Profile Not Found</h1>
          <button onClick={signOut} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const isEmergencyActive = !!activeAlert || userData.status === 'emergency' || userData.status === 'responding';

  // Coordinates for Map
  const userLat = activeAlert?.lat || 28.6139;
  const userLng = activeAlert?.lng || 77.2090;
  const amboLat = activeAlert?.amboLat || (userLat + 0.012);
  const amboLng = activeAlert?.amboLng || (userLng + 0.009);
  const hospLat = activeAlert?.hospLat || (userLat - 0.015);
  const hospLng = activeAlert?.hospLng || (userLng - 0.011);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/95 via-stone-100/90 to-orange-50/90 font-sans selection:bg-amber-500/20 flex flex-col relative overflow-x-hidden text-slate-900">
      {/* Background Image: Family Waiting at Home / Caring Family Support */}
      <div 
        className="absolute inset-0 z-0 opacity-12 pointer-events-none bg-cover bg-center fixed"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2000&q=80')` }}
      />

      {/* Top Navbar */}
      <header className="bg-white/85 border-b border-amber-200/80 sticky top-0 z-50 px-4 sm:px-6 h-16 flex items-center justify-between backdrop-blur-xl shadow-sm text-slate-900 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-amber-600/30">
            <ShieldAlert size={18} />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-wide flex items-center gap-2">
            Operation Rakshak <span className="text-amber-700 font-medium text-xs bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">Family & Telemetry Safe</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-200 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xs">
              {userData.name ? userData.name.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <span className="text-sm font-semibold text-slate-800">{userData.name}</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-sm">
            <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 relative z-10">
        
        {/* Emergency Active Alert Top Header Bar */}
        {isEmergencyActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-2xl p-4 sm:p-5 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-red-400/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/30 animate-pulse">
                <Radio size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    PRIORITY 1 DISPATCH
                  </span>
                  <span className="text-xs font-mono opacity-90">{activeAlert?.id || 'ACTIVE EMERGENCY'}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Live Emergency Protocol Active — Responding Units Deployed
                </h2>
                <p className="text-xs text-red-100 opacity-90 mt-0.5">
                  Control Room assigned ALS Ambulance &bull; AIIMS Trauma Bay 4 Prepared &bull; ETA: ~6 Mins
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <a 
                href="tel:112"
                className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <PhoneCall size={14} /> Call 112
              </a>
              <button 
                onClick={cancelSOS}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 text-white rounded-xl text-xs font-bold border border-white/30 transition-all flex items-center gap-1.5"
              >
                <X size={14} /> False Alarm / Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 1: HOME DASHBOARD */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <RakshakDeviceStatus />
            <RakshakSensorDisplay />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-1">
              {/* System Status Card */}
              <div className={`${isEmergencyActive ? 'bg-red-500/10 border-red-500/50' : 'bg-white/85 border-amber-200/80 shadow-xl shadow-amber-900/10'} rounded-2xl p-6 border backdrop-blur-xl transition-colors duration-500 text-slate-900`}>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">System Status</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-3.5 h-3.5 ${isEmergencyActive ? 'bg-red-500' : 'bg-emerald-500'} rounded-full`}></div>
                    <div className={`w-3.5 h-3.5 ${isEmergencyActive ? 'bg-red-500' : 'bg-emerald-500'} rounded-full absolute inset-0 animate-ping`}></div>
                  </div>
                  <div>
                    <p className={`text-base font-bold ${isEmergencyActive ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isEmergencyActive ? 'Emergency Units Responding' : 'Active & Telemetry Monitored'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isEmergencyActive ? 'Direct satellite & telemetry link live' : 'All vehicle sensors online'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="bg-white/85 rounded-2xl p-6 border border-amber-200/80 backdrop-blur-xl shadow-xl shadow-amber-900/10 space-y-4 text-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-700 border border-amber-200">
                    <Car size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Registered Vehicle</h2>
                    <p className="text-xs text-slate-500">Crash & SOS Telemetry Unit</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Registration</span>
                    <span className="font-mono font-bold text-slate-800">{userData.vehicle?.regNo || 'DL 01 AX 4589'}</span>
                  </div>
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Vehicle Model</span>
                    <span className="font-semibold text-slate-800 text-xs">{userData.vehicle?.model || 'Tata Nexon EV'}</span>
                  </div>
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Device Telemetry</span>
                    <span className="font-mono text-emerald-700 text-xs flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {userData.device?.id || 'RAKSHAK-IOT-482'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 2 Columns: Panic Trigger & Quick Overview */}
            <div className="lg:col-span-2 space-y-6 flex flex-col">
              <div className="bg-white/85 rounded-2xl p-6 sm:p-8 border border-amber-200/80 text-center space-y-6 shadow-xl backdrop-blur-xl text-slate-900">
                <div className="max-w-md mx-auto space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">Rakshak Advanced Emergency & Live Response System</h2>
                  <p className="text-xs text-slate-600">
                    Pressing the panic trigger immediately broadcasts your live GPS coordinates, assigns an Advanced Life Support ambulance, and alerts AIIMS Trauma Center and waiting family.
                  </p>
                </div>

                <button 
                  onClick={triggerSOS}
                  disabled={isTriggering}
                  className="w-full max-w-lg mx-auto py-10 rounded-2xl font-black text-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-600 hover:text-white hover:shadow-[0_0_35px_rgba(220,38,38,0.3)] active:scale-98 group cursor-pointer shadow-sm"
                >
                  <div className="w-20 h-20 rounded-full bg-red-100 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <ShieldAlert size={44} className="text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <span>{isTriggering ? 'TRANSMITTING SOS...' : 'MANUAL SOS TRIGGER'}</span>
                    <p className="text-xs font-normal opacity-80 mt-1">Tap to immediately deploy ambulance & alert hospital</p>
                  </div>
                </button>

                <div className="flex justify-center max-w-lg mx-auto pt-2">
                  <button
                    onClick={handleShareGPSWhatsApp}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2.5 text-sm font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Share2 size={18} />
                    Live Family GPS Link (Share via WhatsApp)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* TAB 2: LIVE TRACKING */}
        {activeTab === 'live-tracking' && (
          <div className="space-y-6">
            <div className="bg-white/85 rounded-2xl p-5 border border-amber-200/80 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Navigation className="text-amber-700" size={20} />
                  Live Intercept & Telemetry Tracking
                </h2>
                <p className="text-xs text-slate-600">Real-time GPS synchronization between your vehicle, dispatched ambulance, and hospital triage.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-amber-100 text-amber-900 text-xs font-mono font-bold rounded-xl border border-amber-200">
                  ETA: {activeAlert?.waitTime || '6 MIN'}
                </span>
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 text-xs font-mono font-bold rounded-xl border border-emerald-200">
                  Status: {activeAlert?.status || (isEmergencyActive ? 'RESPONDING' : 'IDLE / SECURE')}
                </span>
              </div>
            </div>

            {/* Map Container */}
            <div className="bg-white/90 rounded-2xl border border-amber-200/80 overflow-hidden shadow-2xl relative h-[500px] flex flex-col">
              <div className="flex-1 w-full h-full relative z-0">
                <MapContainer 
                  center={[userLat, userLng]} 
                  zoom={14} 
                  style={{ height: '100%', width: '100%', background: '#fffbeb' }}
                  zoomControl={false}
                >
                  <MapRecenter center={[userLat, userLng]} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <Marker position={[userLat, userLng]} icon={userMarkerIcon}>
                    <Popup>
                      <div className="text-slate-900 p-1">
                        <h4 className="font-bold text-xs text-red-600">Your Location</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">{activeAlert?.loc || 'GPS Locked'}</p>
                      </div>
                    </Popup>
                  </Marker>

                  <Marker position={[amboLat, amboLng]} icon={amboMarkerIcon}>
                    <Popup>
                      <div className="text-slate-900 p-1">
                        <h4 className="font-bold text-xs text-blue-600">Ambulance AMB-108</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">Driver: Ramesh Kumar</p>
                      </div>
                    </Popup>
                  </Marker>

                  <Marker position={[hospLat, hospLng]} icon={hospMarkerIcon}>
                    <Popup>
                      <div className="text-slate-900 p-1">
                        <h4 className="font-bold text-xs text-emerald-600">AIIMS Trauma Center</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">Trauma ICU Bay 4 Prepared</p>
                      </div>
                    </Popup>
                  </Marker>

                  <Polyline 
                    positions={[
                      [amboLat, amboLng],
                      [userLat, userLng]
                    ]}
                    pathOptions={{ color: '#d97706', weight: 4, dashArray: '8, 8', opacity: 0.8 }}
                  />
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NEAR HOSPITALS */}
        {activeTab === 'near-hospitals' && (
          <div className="space-y-6">
            <div className="bg-white/85 rounded-2xl p-6 border border-amber-200/80 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={20} className="text-amber-700" /> 
                  Nearest Trauma Centers & Hospital Live Readiness
                </h2>
                <span className="text-xs text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 font-semibold">
                  Live Bed Capacity Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {NEARBY_HOSPITALS.map((hospital, idx) => (
                  <div key={idx} className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg">
                        {hospital.beds} Beds Available
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-800">{hospital.distance}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{hospital.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{hospital.type} &bull; ETA: {hospital.eta}</p>
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <a 
                        href={`tel:${hospital.phone}`}
                        className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs text-center transition-colors shadow-sm"
                      >
                        Call Triage
                      </a>
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(hospital.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-white hover:bg-amber-100 text-slate-700 rounded-xl border border-amber-200 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MY ALERTS */}
        {activeTab === 'my-alerts' && (
          <div className="space-y-6">
            <div className="bg-white/85 rounded-2xl p-6 border border-amber-200/80 backdrop-blur-xl shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BellRing size={20} className="text-amber-700" />
                My SOS Alert & Incident Logs
              </h2>
              <div className="space-y-3">
                {allAlerts.length > 0 ? (
                  allAlerts.map((alert: any, idx: number) => (
                    <div key={idx} className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">{alert.id}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${alert.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 animate-pulse'}`}>
                            {alert.status?.toUpperCase() || 'ACTIVE'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{alert.loc || 'GPS Location Synced'} &bull; Ambulance: {alert.ambulanceNumber || 'AMB-108'}</p>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        {new Date(alert.timestamp || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500 bg-amber-50/40 rounded-2xl border border-amber-200/60">
                    No active or past emergency incidents logged. Your telemetry is secure.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EMERGENCY CONTACTS */}
        {activeTab === 'emergency-contacts' && (
          <div className="space-y-6">
            <div className="bg-white/85 rounded-2xl p-6 border border-amber-200/80 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users size={20} className="text-amber-700" />
                    Family & Emergency Contacts
                  </h2>
                  <p className="text-xs text-slate-600">These contacts are instantly notified via SMS & push alert when an SOS is triggered.</p>
                </div>
                <button 
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Contact
                </button>
              </div>

              {showAddContact && (
                <form onSubmit={handleAddContact} className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">Add New Family Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Contact Name" 
                      value={newContactName} 
                      onChange={e => setNewContactName(e.target.value)}
                      className="px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs text-slate-900"
                      required 
                    />
                    <input 
                      type="text" 
                      placeholder="Relation (e.g., Spouse, Parent)" 
                      value={newContactRelation} 
                      onChange={e => setNewContactRelation(e.target.value)}
                      className="px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs text-slate-900"
                    />
                    <input 
                      type="tel" 
                      placeholder="Mobile Number (+91 ...)" 
                      value={newContactMobile} 
                      onChange={e => setNewContactMobile(e.target.value)}
                      className="px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs text-slate-900"
                      required 
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAddContact(false)} className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs border border-amber-200">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold">Save Contact</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(userData.emergencyContacts && userData.emergencyContacts.length > 0) ? (
                  userData.emergencyContacts.map((contact: any, idx: number) => (
                    <div key={idx} className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl flex justify-between items-center shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{contact.name}</p>
                        <p className="text-xs text-slate-600 uppercase">{contact.relation} &bull; {contact.mobile}</p>
                      </div>
                      <a href={`tel:${contact.mobile}`} className="p-2 bg-white hover:bg-emerald-600 text-slate-700 hover:text-white rounded-xl border border-amber-200 transition-colors shadow-sm">
                        <PhoneCall size={16} />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Sunita Verma</p>
                      <p className="text-xs text-slate-600 uppercase">Spouse &bull; +91 98765 43211</p>
                    </div>
                    <a href="tel:+919876543211" className="p-2 bg-white hover:bg-emerald-600 text-slate-700 hover:text-white rounded-xl border border-amber-200 transition-colors shadow-sm">
                      <PhoneCall size={16} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TELE-REHAB */}
        {activeTab === 'tele-rehab' && (
          <div className="space-y-6">
            <div className="bg-white/85 rounded-2xl p-6 border border-amber-200/80 backdrop-blur-xl shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse size={20} className="text-amber-700" />
                Post-Trauma Tele-rehab & Recovery Care
              </h2>
              <p className="text-xs text-slate-600">Access doctor-prescribed physical therapy, guided recovery exercises, and psychological support sessions.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                    <Video size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Virtual Physiotherapy</h3>
                  <p className="text-xs text-slate-600">Daily live guided session with certified trauma rehabilitation specialists.</p>
                  <button className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors">
                    Join Session
                  </button>
                </div>

                <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
                    <Activity size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Mobility Milestone Tracker</h3>
                  <p className="text-xs text-slate-600">Monitor range of motion and joint recovery progress post-discharge.</p>
                  <div className="w-full py-2 bg-white text-slate-800 rounded-xl text-xs font-bold text-center border border-amber-200">
                    Progress: 84% Recovered
                  </div>
                </div>

                <div className="bg-amber-50/80 border border-amber-200 p-5 rounded-2xl space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center font-bold">
                    <HeartPulse size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Trauma Counseling</h3>
                  <p className="text-xs text-slate-600">Confidential mental health support and counseling for survivors and family.</p>
                  <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors">
                    Book Counselor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: REPORT AN ACCIDENT */}
        {activeTab === 'report-accident' && (
          <div className="space-y-6">
            <div className="bg-white/85 rounded-2xl p-6 sm:p-8 border border-amber-200/80 backdrop-blur-xl shadow-xl max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle size={22} className="text-orange-600" />
                  Manual Accident & Incident Report Form
                </h2>
                <p className="text-xs text-slate-600 mt-1">If your automatic IoT crash sensor did not trigger or you witnessed an incident, submit details here for immediate dispatch.</p>
              </div>

              {reportSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">✓</div>
                  <h3 className="text-base font-bold text-emerald-900">Incident Reported & Emergency Dispatched</h3>
                  <p className="text-xs text-emerald-700">Control room has received your report. Ambulance AMB-108 is en route to your GPS coordinates.</p>
                  <button onClick={() => { setReportSubmitted(false); setActiveTab('live-tracking'); }} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                    View Live Tracking
                  </button>
                </div>
              ) : (
                <form onSubmit={handleManualReport} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Incident Severity</label>
                    <select 
                      value={reportSeverity} 
                      onChange={e => setReportSeverity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs font-semibold text-slate-900"
                    >
                      <option value="Minor">Minor Fender Bender / No Injuries</option>
                      <option value="Moderate">Moderate Crash / Minor Injuries</option>
                      <option value="Severe">Severe Collision / Critical Medical Emergency</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Accident Description & Notes</label>
                    <textarea 
                      rows={4}
                      placeholder="Describe what happened, vehicle condition, and number of passengers needing medical attention..."
                      value={reportNotes}
                      onChange={e => setReportNotes(e.target.value)}
                      className="w-full px-3 py-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-slate-900"
                      required
                    />
                  </div>

                  <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center gap-3">
                    <MapPin size={20} className="text-amber-700 flex-shrink-0" />
                    <div className="text-xs text-slate-700">
                      <span className="font-bold text-slate-900">Current GPS Coordinates Attached:</span> 28.6139° N, 77.2090° E (Outer Ring Road)
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={18} /> Submit Incident & Dispatch Ambulance
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white/85 rounded-2xl p-6 border border-amber-200/80 backdrop-blur-xl shadow-xl max-w-2xl mx-auto space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <SettingsIcon size={20} className="text-amber-700" />
                Account & Vehicle Telemetry Settings
              </h2>

              <div className="space-y-4">
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">Profile Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Full Name</span>
                      <span className="font-bold text-slate-900">{userData.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Mobile Number</span>
                      <span className="font-bold text-slate-900">{userData.mobile}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">IoT Device & Vehicle Registration</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Vehicle Registration</span>
                      <span className="font-bold font-mono text-slate-900">{userData.vehicle?.regNo || 'DL 01 AX 4589'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Telemetry Device ID</span>
                      <span className="font-bold font-mono text-emerald-700">{userData.device?.id || 'RAKSHAK-IOT-482'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={signOut} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                    Sign Out of Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
