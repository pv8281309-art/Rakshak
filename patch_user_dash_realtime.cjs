const fs = require('fs');
const filePath = 'src/pages/user/UserDashboard.tsx';

const newContent = `import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { doc, getDocs, collection, query, where, updateDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { LogOut, ShieldAlert, Navigation, Car, Phone, User, Activity, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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
          // First, get the document ID for the customer
          const q = query(collection(db, 'customers'));
          const snapshot = await getDocs(q);
          const matchingDoc = snapshot.docs.find(d => d.data().customerId === clientSession.id);
          
          if (matchingDoc) {
            // Setup real-time listener on this specific document
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
    // If SOS is already active/responding, do not trigger again.
    if (userData?.status === 'emergency' || userData?.status === 'responding') {
       return;
    }

    if (isFirebaseConfigured && db && userData && userData.id) {
      try {
        const sosId = \`SOS-\${Math.floor(1000 + Math.random() * 9000)}\`;
        
        // 1. Create sos_alerts document so admin sees it instantly
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

        // 2. Update customer document status
        await updateDoc(doc(db, 'customers', userData.id), {
          status: 'emergency',
          lastSosTrigger: new Date().toISOString()
        });
        
      } catch (e) {
        console.error("SOS Trigger failed", e);
        alert("SOS Triggered! (Failed to sync with cloud)");
      }
    } else {
      alert("SOS Alert Sent! (Local Mock)");
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  if (!userData) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">User not found. Please log in again.</div>;

  const getStatusDisplay = () => {
    if (userData.status === 'emergency') {
       return {
         text: "EMERGENCY TRIGGERED - WAITING FOR ADMIN",
         subText: "Alert sent. Please stay calm.",
         color: "text-red-500",
         bg: "bg-red-500/10",
         border: "border-red-500",
         icon: <ShieldAlert size={28} className="animate-pulse" />
       };
    }
    if (userData.status === 'responding') {
       return {
         text: "RESPONSE DISPATCHED",
         subText: "Admin has acknowledged. Help is on the way.",
         color: "text-orange-500",
         bg: "bg-orange-500/10",
         border: "border-orange-500",
         icon: <Clock size={28} className="animate-spin-slow" />
       };
    }
    return {
       text: "EMERGENCY SOS",
       subText: "Active & Monitored",
       color: "text-emerald-500",
       bg: "bg-emerald-500/10",
       border: "border-emerald-500",
       icon: <CheckCircle size={28} />
    };
  };

  const statusInfo = getStatusDisplay();
  const isEmergencyActive = userData.status === 'emergency' || userData.status === 'responding';

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#020617] border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.5)]">
            <ShieldAlert size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">Operation Rakshak <span className="text-blue-500 font-medium text-sm ml-2 hidden sm:inline">User Portal</span></h1>
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
                  {isEmergencyActive ? 'Emergency Active' : 'Active & Monitored'}
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
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                <p className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider mb-1">Customer ID</p>                <p className="font-mono text-slate-400">{userData.customerId}</p>
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

        {/* Right Col: Map & Actions */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          {/* Map Area */}
          <div className={\`flex-1 min-h-[400px] \${isEmergencyActive ? 'bg-red-950/20 border-red-500/30' : 'bg-[#020617] border-slate-800'} rounded-2xl border overflow-hidden relative shadow-2xl transition-colors duration-500\`}>
             {/* Fake Map UI */}
             <div className="absolute inset-0 bg-[#0B1120]">
                {/* Grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                
                {/* Simulated Path */}
                <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                  <path d="M 100,300 C 200,200 300,400 500,250 C 700,100 800,300 900,200" fill="none" stroke={isEmergencyActive ? "#ef4444" : "#3b82f6"} strokeWidth="4" strokeDasharray="8 8" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500 gap-4">
                  <div className="relative">
                    <div className={\`w-16 h-16 \${isEmergencyActive ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-blue-500/10 text-blue-500'} rounded-full flex items-center justify-center\`}>
                      {isEmergencyActive ? <ShieldAlert size={32} /> : <Navigation size={32} />}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className={\`font-semibold \${isEmergencyActive ? 'text-red-400' : 'text-slate-300'} tracking-wide\`}>
                      {isEmergencyActive ? 'Live Emergency Tracking' : 'Live GPS Tracking'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Vehicle is moving • 45 km/h</p>
                  </div>
                </div>
                
                {/* Overlays */}
                <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                   <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 text-xs font-medium text-slate-300 shadow-lg">
                     Last updated: Just now
                   </div>
                   <div className={\`px-4 py-2 \${isEmergencyActive ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'} backdrop-blur-md rounded-xl border text-xs font-bold shadow-lg uppercase tracking-wider\`}>
                     {isEmergencyActive ? 'EMERGENCY MODE' : 'Tracking Active'}
                   </div>
                </div>
             </div>
          </div>

          {/* Action Strip */}
          <div className="flex gap-4">
            <button 
              onClick={triggerSOS}
              disabled={isEmergencyActive}
              className={\`flex-1 py-6 rounded-2xl font-black text-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 \${
                isEmergencyActive 
                  ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.6)] cursor-not-allowed opacity-90' 
                  : 'bg-red-500/10 text-red-500 border-2 border-red-500/30 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]'
              }\`}
            >
              <div className="flex items-center gap-3">
                 {statusInfo.icon}
                 {isEmergencyActive ? (userData.status === 'responding' ? 'RESPONSE DISPATCHED' : 'EMERGENCY TRIGGERED') : 'EMERGENCY SOS'}
              </div>
              {isEmergencyActive && (
                 <span className="text-sm font-medium text-red-100 opacity-90">{userData.status === 'responding' ? 'Admin has acknowledged. Help is on the way.' : 'Alert sent. Waiting for Admin response...'}</span>
              )}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newContent);
console.log("Patched UserDashboard realtime sync");
