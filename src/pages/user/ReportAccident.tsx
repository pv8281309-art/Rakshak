import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { doc, getDocs, collection, query, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { AlertTriangle, MapPin, Camera, CheckCircle, Clock, ShieldAlert, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportAccident() {
  const { clientSession } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Fetching location...');
  const [latLng, setLatLng] = useState({ lat: 0, lng: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [activeReport, setActiveReport] = useState<any>(null);

  useEffect(() => {
    if (!clientSession?.id) return;
    let unsubscribe: any = null;

    const setupUser = async () => {
      if (isFirebaseConfigured && db) {
        try {
          const q = query(collection(db, 'customers'));
          const snapshot = await getDocs(q);
          const matchingDoc = snapshot.docs.find(d => d.data().customerId === clientSession.id);
          
          if (matchingDoc) {
            setUserData({ id: matchingDoc.id, ...matchingDoc.data() });
            
            // Check if there's an active emergency
            const data = matchingDoc.data();
            if ((data.status === 'emergency' || data.status === 'responding') && data.lastSosId) {
               // Subscribe to the active SOS alert
               unsubscribe = onSnapshot(doc(db, 'sos_alerts', data.lastSosId), (docSnap) => {
                  if (docSnap.exists()) {
                     setActiveReport({ id: docSnap.id, ...docSnap.data() });
                  } else {
                     setActiveReport(null); // was resolved or deleted
                  }
               });
            }
          }
        } catch (e) {
          console.error("Failed to load user data", e);
        }
      }
    };
    setupUser();

    // Try to get actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
           setLatLng({ lat: position.coords.latitude, lng: position.coords.longitude });
           setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        () => {
           setLocation('Location access unavailable. Select manually.');
        }
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [clientSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !isFirebaseConfigured || !db) {
       alert("System unavailable. Please call 112 immediately.");
       return;
    }

    setSubmitting(true);
    try {
      const sosId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newSOS = {
        id: sosId,
        customerId: userData.customerId,
        user: userData.name,
        vehicle: userData.vehicle?.regNo || 'Unknown',
        mobile: userData.emergencyContacts?.[0]?.mobile || 'Unknown',
        type: `Manual Report: ${description || 'Accident'}`,
        severity: severity.toLowerCase(),
        loc: location,
        lat: latLng.lat || 28.6139,
        lng: latLng.lng || 77.2090,
        status: 'new',
        timestamp: Date.now(),
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'sos_alerts', sosId), newSOS);

      await updateDoc(doc(db, 'customers', userData.id), {
        status: 'emergency',
        lastSosTrigger: new Date().toISOString(),
        lastSosId: sosId
      });
      
      // Local state will update via useEffect snapshot, but we can set it optimistically
      setActiveReport(newSOS);
      
    } catch (e) {
      console.error("SOS Trigger failed", e);
      alert("Failed to submit report. Please call 112.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!userData) {
    return <div className="p-8 text-center text-slate-400">Loading emergency information...</div>;
  }

  // Active Report View
  if (activeReport && activeReport.status !== 'resolved') {
     return (
       <div className="max-w-3xl mx-auto space-y-6">
         <div className="bg-[#020617]/50 rounded-2xl border border-red-500/30 overflow-hidden shadow-2xl shadow-red-900/10">
           <div className="bg-red-500/10 p-6 border-b border-red-500/20 text-center">
             <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
               <ShieldAlert size={32} />
             </div>
             <h2 className="text-2xl font-bold text-red-400 mb-1">Accident Report Received</h2>
             <p className="text-slate-300">Your report has been securely logged. Help is being coordinated.</p>
           </div>
           
           <div className="p-6 md:p-8 space-y-8">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
                 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Report ID</p>
                 <p className="font-mono font-bold text-slate-200">{activeReport.id}</p>
               </div>
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center">
                 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                 <p className="font-bold text-orange-400">{activeReport.status === 'new' ? 'PROCESSING' : activeReport.status.toUpperCase()}</p>
               </div>
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-center col-span-2 md:col-span-2">
                 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Location</p>
                 <p className="font-medium text-slate-300 truncate">{activeReport.loc}</p>
               </div>
             </div>

             {/* Status Timeline */}
             <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6 pt-2 pb-2">
               <div className="relative">
                 <div className="absolute -left-[31px] bg-emerald-500 rounded-full p-1 border-4 border-[#020617] text-white">
                   <CheckCircle size={14} />
                 </div>
                 <h4 className="text-sm font-bold text-white">Reported</h4>
                 <p className="text-xs text-slate-400 mt-1">Report submitted successfully.</p>
               </div>
               <div className="relative">
                 <div className={`absolute -left-[31px] rounded-full p-1 border-4 border-[#020617] ${activeReport.status === 'responding' || activeReport.status === 'dispatched' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white animate-pulse'}`}>
                   {activeReport.status === 'responding' || activeReport.status === 'dispatched' ? <CheckCircle size={14} /> : <Clock size={14} />}
                 </div>
                 <h4 className="text-sm font-bold text-white">Processing / Assignment</h4>
                 <p className="text-xs text-slate-400 mt-1">Admin is reviewing and assigning an ambulance.</p>
               </div>
               <div className="relative">
                 <div className={`absolute -left-[31px] rounded-full p-1 border-4 border-[#020617] ${activeReport.status === 'dispatched' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                   <Navigation size={14} />
                 </div>
                 <h4 className={`text-sm font-bold ${activeReport.status === 'dispatched' ? 'text-white' : 'text-slate-500'}`}>Ambulance On The Way</h4>
                 <p className="text-xs text-slate-500 mt-1">Awaiting dispatch confirmation.</p>
               </div>
             </div>
           </div>
         </div>
       </div>
     );
  }

  // Form View
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-red-500" /> Report Accident
        </h1>
        <p className="text-slate-400 mt-1">Provide details to dispatch emergency services immediately.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#020617]/50 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm space-y-6 shadow-xl">
        
        {/* Severity */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Severity</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSeverity(level)}
                className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                  severity === level 
                    ? (level === 'CRITICAL' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 
                       level === 'HIGH' ? 'bg-orange-600 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 
                       'bg-blue-600 border-blue-500 text-white')
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Location</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter exact location or landmark"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">GPS location will be automatically captured if permitted.</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Description (Optional)</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
            placeholder="Briefly describe the situation, number of vehicles involved, or specific injuries..."
          />
        </div>

        {/* Evidence */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Evidence (Optional)</label>
          <button type="button" className="w-full py-4 border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-400 bg-slate-900/30 hover:bg-blue-900/10 transition-colors">
            <Camera size={24} />
            <span className="text-sm font-medium">Upload Image / Video</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:text-red-300 text-white rounded-xl font-bold text-lg tracking-wide shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex justify-center items-center gap-2"
        >
          {submitting ? (
             <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <AlertTriangle size={20} />
              SUBMIT EMERGENCY REPORT
            </>
          )}
        </button>
      </form>
    </div>
  );
}
