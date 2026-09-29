import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldAlert, PhoneCall, CheckCircle, Clock, Building2, MapPin, X, Navigation, RefreshCw, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, onSnapshot, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useEmergencyResponse } from '../../contexts/EmergencyResponseContext';
import { TelemetrySyncService } from '../../services/TelemetrySyncService';

const AlertsSOS = () => {
  const { openEmergency, resolveEmergency, markResponding } = useEmergencyResponse();
  const [activeTab, setActiveTab] = useState<'sos' | 'alerts'>('sos');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time listener for SOS alerts
  useEffect(() => {
    let unsubscribe: any = null;
    
    const fetchLocalAlerts = () => {
      try {
        TelemetrySyncService.initialize();
        const list = TelemetrySyncService.getSosAlerts();
        return Array.isArray(list) ? list.filter((a: any) => a && a.id !== 'SOS-2026-9921') : [];
      } catch(e) {
        return [];
      }
    };

    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'sos_alerts'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fireAlerts = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((a: any) => a && a.id !== 'SOS-2026-9921');
        
        // Merge with local to ensure nothing drops
        const localAlerts = fetchLocalAlerts();
        const merged = [...fireAlerts];
        localAlerts.forEach((la: any) => {
          if (!merged.find(m => m.id === la.id)) {
            merged.push(la);
          }
        });
        
        // sort by timestamp descending
        merged.sort((a, b) => {
          const tA = (a as any).createdAt?.seconds ? (a as any).createdAt.seconds * 1000 : ((a as any).timestamp || 0);
          const tB = (b as any).createdAt?.seconds ? (b as any).createdAt.seconds * 1000 : ((b as any).timestamp || 0);
          return tB - tA;
        });

        setAlerts(merged);
        localStorage.setItem('rakshak_sos_alerts', JSON.stringify(merged));
        setLoading(false);
      }, (error) => {
        console.warn("Firestore SOS Listener Error:", error.message);
        setAlerts(fetchLocalAlerts());
        setLoading(false);
      });
    } else {
      setAlerts(fetchLocalAlerts());
      setLoading(false);
      
      const interval = setInterval(() => {
        setAlerts(fetchLocalAlerts());
      }, 3000);
      return () => clearInterval(interval);
    }

    const onStorage = () => {
      setAlerts(fetchLocalAlerts());
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleClearAllAlerts = async () => {
    TelemetrySyncService.clearAllAlerts();
    setAlerts([]);

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'sos_alerts'));
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
          try {
            await updateDoc(doc(db, 'sos_alerts', d.id), { status: 'resolved' });
          } catch {}
        });
      } catch {}
    }
  };

  const handleStatusUpdate = async (sosId: string, newStatus: string) => {
    if (newStatus === 'resolved') {
      await resolveEmergency(sosId, 'Resolved from SOS table');
    } else if (newStatus === 'responding') {
      await markResponding(sosId);
    }

    // Update local state
    setAlerts(prev => {
      const updated = prev.map(a => a.id === sosId ? { ...a, status: newStatus } : a);
      localStorage.setItem('rakshak_sos_alerts', JSON.stringify(updated));
      return updated;
    });
  };

  const formatTime = (ts: any) => {
    if (!ts) return 'Active Now';
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const filteredAlerts = alerts.filter(a => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (a.user || '').toLowerCase().includes(q);
      const matchVehicle = (a.vehicle || '').toLowerCase().includes(q);
      const matchId = (a.id || '').toLowerCase().includes(q);
      const matchLoc = (a.loc || '').toLowerCase().includes(q);
      if (!matchName && !matchVehicle && !matchId && !matchLoc) return false;
    }
    if (activeTab === 'sos') {
      return a.status !== 'resolved' || a.severity === 'critical';
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Alerts & SOS Command Center 
            {alerts.filter(a => a.status === 'new').length > 0 && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400">Verified collision telemetry and Golden-Hour emergency response dispatch.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {alerts.length > 0 && (
            <button
              onClick={handleClearAllAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Clear all alerts and reset to standby"
            >
              <Trash2 size={13} className="text-red-400" />
              <span>Clear All Alerts</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Time Telemetry Active
          </div>
          
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-700 shadow-xs">
            <button 
              onClick={() => setActiveTab('sos')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === 'sos' ? "bg-red-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              )}
            >
              Active SOS ({alerts.filter(a => a.status !== 'resolved').length})
            </button>
            <button 
              onClick={() => setActiveTab('alerts')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === 'alerts' ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              )}
            >
              All Telemetry Logs
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by driver name, vehicle registration (e.g. DL 01 AK 4921), incident ID, or highway..."
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 placeholder:text-slate-500"
        />
      </div>

      {/* Data Table */}
      <div className="bolt-card rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Incident ID</th>
                <th className="p-4">Telemetry Impact</th>
                <th className="p-4">User & Vehicle</th>
                <th className="p-4">Highway Location & Time</th>
                <th className="p-4">Response Status</th>
                <th className="p-4 text-right">Emergency Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Synchronizing live SOS feeds...</td></tr>
              ) : filteredAlerts.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400 flex flex-col items-center">
                  <ShieldAlert size={48} className="mb-4 text-slate-600" />
                  <p className="text-white font-semibold">No active emergencies found in this filter.</p>
                  <p className="text-xs mt-1 text-slate-400">Listening on 100Hz telemetry and OBD-II collision sensors.</p>
                </td></tr>
              ) : filteredAlerts.map((sos) => (
                <tr 
                  key={sos.id} 
                  onClick={() => openEmergency(sos.id)}
                  className={cn(
                    "transition-colors group cursor-pointer",
                    sos.status === 'new' ? "bg-red-950/30 hover:bg-red-950/50" : "hover:bg-slate-800/50"
                  )}
                >
                  <td className="p-4">
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">{sos.id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={16} className={sos.severity === 'critical' ? 'text-red-500 animate-pulse' : 'text-amber-400'} />
                      <span className="text-sm text-white font-semibold">{sos.type || 'High-G Collision'}</span>
                    </div>
                    {sos.gForce && (
                      <span className="text-[10px] font-mono text-red-400 font-bold block mt-0.5">
                        Impact Force: {sos.gForce}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-white">{sos.user}</div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-1">
                      <span>ID: {sos.customerId}</span> | 
                      <span className="text-slate-200 font-semibold">{sos.vehicle}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <PhoneCall size={10} /> {sos.mobile}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-200 flex items-start gap-1">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-red-400" />
                      <span>{sos.loc}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1 ml-4">
                      <Clock size={12} /> {formatTime(sos.createdAt || sos.timestamp)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      sos.status === 'new' ? "bg-red-950 text-red-400 border border-red-500/40 shadow-xs" :
                      sos.status === 'responding' ? "bg-amber-950 text-amber-400 border border-amber-500/40" :
                      "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                    )}>
                      {sos.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                      {sos.status === 'responding' && <Clock size={12} />}
                      {sos.status === 'resolved' && <CheckCircle size={12} />}
                      {sos.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => openEmergency(sos.id)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5",
                          sos.assignedHospitalName 
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900"
                            : "bg-red-600 hover:bg-red-500 text-white"
                        )}
                        title={sos.assignedHospitalName ? `Assigned to ${sos.assignedHospitalName}` : 'Assign hospital for this SOS'}
                      >
                        <Building2 size={13} />
                        <span>{sos.assignedHospitalName ? `Hospital: ${sos.assignedHospitalName.slice(0, 16)}` : 'Dispatch Rescue'}</span>
                      </button>
                      <button 
                        onClick={() => openEmergency(sos.id)}
                        className="p-1.5 text-slate-300 hover:text-blue-400 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors shadow-xs" 
                        title="View Details & Location"
                      >
                        <MapPin size={16} />
                      </button>
                      {sos.status !== 'resolved' && (
                        <button 
                          onClick={() => handleStatusUpdate(sos.id, 'resolved')}
                          className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-lg transition-colors shadow-xs"
                        >
                          RESOLVE
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertsSOS;
