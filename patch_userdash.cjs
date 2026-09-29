const fs = require('fs');

const code = `import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { doc, getDocs, collection, query, where, updateDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { LogOut, ShieldAlert, Navigation, Car, Phone, User, MapPin, Share2, AlertTriangle, Cross } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const amboIcon = new L.DivIcon({
  className: 'custom-leaflet-icon',
  html: '<div class="animate-ping" style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Mock nearby hospitals data for demo
const NEARBY_HOSPITALS = [
  { name: 'AIIMS Trauma Center', distance: '2.5 km', eta: '8 mins', phone: '+91 11 2658 8500', type: 'Level 1 Trauma' },
  { name: 'Safdarjung Hospital', distance: '3.1 km', eta: '12 mins', phone: '+91 11 2616 5060', type: 'Govt. Hospital' },
  { name: 'Max Super Speciality', distance: '4.8 km', eta: '15 mins', phone: '+91 11 2651 5050', type: 'Private' }
];

export default function UserDashboard() {
  const { clientSession, signOut } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Real-time listener for user data
  useEffect(() => {
    if (!clientSession?.id) {
      setLoading(false);
      return;
    }

    let unsubscribe: any = null;

    const setupListener = async () => {
      if (isFirebaseConfigured && db) {
        try {
          const q = query(collection(db, 'customers'));
          const snapshot = await getDocs(q);
          const matchingDoc = snapshot.docs.find(d => d.data().customerId === clientSession.id);
          
          if (matchingDoc) {
            unsubscribe = onSnapshot(doc(db, 'customers', matchingDoc.id), (docSnap) => {
              if (docSnap.exists()) {
                setUserData({ id: docSnap.id, ...docSnap.data() });
              }
            });
          } else {
             loadLocal();
          }
        } catch (err) {
          console.warn("Firebase fetch failed, using local", err);
          loadLocal();
        }
      } else {
        loadLocal();
      }
      setLoading(false);
    };

    const loadLocal = () => {
      const localData = JSON.parse(localStorage.getItem('rakshak_customers') || '[]');
      const user = localData.find((c: any) => c.customerId === clientSession.id);
      if (user) setUserData(user);
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [clientSession]);

  const triggerSOS = async () => {
    if (userData?.status === 'emergency' || userData?.status === 'responding') {
       return;
    }

    if (isFirebaseConfigured && db && userData && userData.id) {
      try {
        const sosId = \`SOS-\${Math.floor(1000 + Math.random() * 9000)}\`;
        
        const newSOS = {
          id: sosId,
          customerId: userData.customerId,
          user: userData.name,
          vehicle: userData.vehicle?.regNo || 'Unknown',
          mobile: userData.emergencyContacts?.[0]?.mobile || 'Unknown',
          type: 'Manual Panic (User Dash)',
          severity: 'critical',
          loc: 'Live GPS Location (Simulated)',
          lat: 28.6139 + (Math.random() * 0.05 - 0.025),
          lng: 77.2090 + (Math.random() * 0.05 - 0.025),
          status: 'new',
          timestamp: Date.now(),
          createdAt: serverTimestamp()
        };

        await setDoc(doc(db, 'sos_alerts', sosId), newSOS);
        
        await updateDoc(doc(db, 'customers', userData.id), {
          status: 'emergency',
          lastSosTrigger: new Date().toISOString()
        });
        
      } catch (e) {
        console.error("SOS Trigger failed", e);
        alert("SOS Triggered! (Failed to sync with cloud)");
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">Loading...</div>;
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data Found</h1>
          <button onClick={signOut} className="px-4 py-2 bg-blue-600 rounded">Go Back</button>
        </div>
      </div>
    );
  }

  const isEmergencyActive = userData.status === 'emergency' || userData.status === 'responding';
  const isResponding = userData.status === 'responding';

  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Navbar */}
      <header className="bg-[#020617] border-b border-slate-800 sticky top-0 z-50 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            <ShieldAlert size={18} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Operation Rakshak 3.2 <span className="text-blue-500 font-medium text-sm ml-2 hidden sm:inline">User Portal</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <User size={16} className="text-slate-400" />
            </div>
            <span className="text-sm font-medium text-slate-300">{userData.name}</span>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Col: Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Status Card */}
          <div className={\`\${isEmergencyActive ? 'bg-red-500/10 border-red-500/50' : 'bg-[#020617]/50 border-slate-800'} rounded-2xl p-6 border backdrop-blur-sm transition-colors duration-500\`}>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">System Status</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={\`w-3 h-3 \${isEmergencyActive ? 'bg-red-500' : 'bg-emerald-500'} rounded-full\`}></div>
                <div className={\`w-3 h-3 \${isEmergencyActive ? 'bg-red-500' : 'bg-emerald-500'} rounded-full absolute inset-0 animate-ping\`}></div>
              </div>
              <div>
                <p className={\`text-lg font-bold \${isEmergencyActive ? 'text-red-400' : 'text-emerald-400'}\`}>
                  {isResponding ? 'Response Dispatched' : (isEmergencyActive ? 'Emergency Active' : 'Active & Monitored')}
                </p>
                <p className="text-xs text-slate-500">Device is connected</p>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-[#020617]/50 rounded-2xl p-6 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Car size={20} />
              </div>
              <h2 className="text-lg font-semibold text-white">Vehicle Details</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider mb-1">Registration Number</p>
                <p className="font-bold text-slate-200 text-lg">{userData.vehicle?.regNo || 'N/A'}</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider mb-1">Device ID</p>
                <p className="font-mono text-slate-300">{userData.device?.id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-[#020617]/50 rounded-2xl p-6 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Phone size={20} />
              </div>
              <h2 className="text-lg font-semibold text-white">Emergency Contacts</h2>
            </div>
            <div className="space-y-3">
              {userData.emergencyContacts?.map((contact: any, idx: number) => (
                <div key={idx} className="bg-slate-900/80 p-3 rounded-xl flex justify-between items-center border border-slate-800">
                  <div>
                    <p className="text-sm font-bold text-slate-200">{contact.name}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{contact.relation}</p>
                  </div>
                  <a href={\`tel:\${contact.mobile}\`} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                    <Phone size={16} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Actions & Map */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {!isResponding ? (
            <>
              {/* Emergency Trigger Section */}
              <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800">
                <button 
                  onClick={triggerSOS}
                  disabled={isEmergencyActive}
                  className={\`w-full py-8 rounded-2xl font-black text-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 \${
                    isEmergencyActive 
                      ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.6)] cursor-not-allowed opacity-90' 
                      : 'bg-red-500/10 text-red-500 border-2 border-red-500/30 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                  }\`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={32} />
                    {isEmergencyActive ? 'EMERGENCY TRIGGERED' : 'MANUAL SOS TRIGGER'}
                  </div>
                  {isEmergencyActive ? (
                    <span className="text-base font-medium text-red-100 opacity-90">Alert sent. Waiting for Admin response...</span>
                  ) : (
                    <span className="text-sm font-medium opacity-80">Tap to instantly alert authorities and emergency contacts</span>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button className="p-4 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl flex items-center justify-center gap-3 text-slate-300 hover:text-white transition-colors">
                    <Share2 size={20} className="text-blue-400" />
                    <span className="font-semibold">Share Live Location</span>
                  </button>
                  <button className="p-4 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl flex items-center justify-center gap-3 text-slate-300 hover:text-white transition-colors">
                    <AlertTriangle size={20} className="text-orange-400" />
                    <span className="font-semibold">Severity Detection</span>
                  </button>
                </div>
              </div>

              {/* Nearby Hospitals Section */}
              <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800 flex-1">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                       <MapPin size={20} className="text-rakshak-cyan" /> Nearby Hospitals & Resources
                    </h2>
                    <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">Updated Live</span>
                 </div>
                 
                 <div className="space-y-4">
                   {NEARBY_HOSPITALS.map((hospital, idx) => (
                     <div key={idx} className="bg-[#020617] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-rakshak-cyan/10 flex items-center justify-center text-rakshak-cyan border border-rakshak-cyan/20">
                            <span className="font-bold">H</span>
                         </div>
                         <div>
                           <h3 className="font-bold text-slate-200">{hospital.name}</h3>
                           <p className="text-xs text-slate-500">{hospital.type} • {hospital.phone}</p>
                         </div>
                       </div>
                       <div className="text-right">
                          <p className="font-bold text-white">{hospital.eta}</p>
                          <p className="text-xs text-slate-400">{hospital.distance} away</p>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </>
          ) : (
            <>
              {/* Ambulance Live Tracking Map */}
              <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-4 mb-4 flex gap-4 items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rakshak-red/20 rounded-full flex items-center justify-center border border-rakshak-red/40">
                       <Navigation size={24} className="text-rakshak-red animate-pulse" />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-white">Ambulance Dispatched</h2>
                       <p className="text-sm text-rakshak-cyan font-medium">Help is on the way. ETA: 8 Mins</p>
                    </div>
                 </div>
                 <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400">Driver Contact</p>
                    <p className="text-lg font-bold text-slate-200">+91 9876543210</p>
                 </div>
              </div>

              <div className="flex-1 min-h-[400px] bg-red-950/20 border-red-500/30 rounded-2xl border overflow-hidden relative shadow-2xl transition-colors duration-500 flex flex-col">
                 {/* Leaflet Map UI */}
                 <div className="flex-1 relative bg-[#020617] z-0">
                    <MapContainer center={[28.6139, 77.2090]} zoom={14} style={{ height: '100%', width: '100%', background: '#020617' }}>
                       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="dark-map-tiles" />
                       <Marker position={[28.6139, 77.2090]} icon={amboIcon}>
                         <Popup>Ambulance En Route</Popup>
                       </Marker>
                    </MapContainer>
                    
                    <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none z-[1000]">
                       <div className="px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 text-xs font-medium text-slate-300 shadow-lg">
                         Live Ambulance Tracking
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Driver</p>
                    <p className="font-bold text-white">Ramesh Kumar</p>
                 </div>
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Vehicle No.</p>
                    <p className="font-bold text-white">DL 1A 9999</p>
                 </div>
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Distance</p>
                    <p className="font-bold text-white">2.5 km</p>
                 </div>
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Hospital</p>
                    <p className="font-bold text-white truncate px-2">AIIMS Trauma</p>
                 </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/user/UserDashboard.tsx', code);
