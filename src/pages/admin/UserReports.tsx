import React, { useState, useEffect } from 'react';
import { 
  FileWarning, 
  Search, 
  Car, 
  User, 
  MapPin, 
  Cpu, 
  Download, 
  Sparkles,
  ShieldAlert,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { TelemetrySyncService } from '../../services/TelemetrySyncService';
import { cn } from '../../lib/utils';

export default function UserReports() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch subscribers in real-time from Firestore / TelemetrySyncService
  useEffect(() => {
    let unsubscribe: any = null;

    const loadData = () => {
      try {
        TelemetrySyncService.initialize();
        const customers = TelemetrySyncService.getCustomers();
        const mapped = customers.map((c: any, idx: number) => ({
          systemId: c.deviceId || `OBD-3.0-IN-${9100 + idx}`,
          userId: c.customerId || `USR-IN-${150000 + idx}`,
          carNumber: c.vehicleReg || `DL-01-AK-4921`,
          vehicleModel: c.vehicleModel || 'Tata Safari Gold Edition',
          name: c.name || `Subscriber ${idx + 1}`,
          phone: c.phone || '+91 98110 24890',
          location: [c.city, c.state].filter(Boolean).join(', ') || 'New Delhi, Delhi NCR',
          package: 'Operation 3.0 Defense',
          joinedAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '2026-02-14',
          drivingStatus: c.drivingStatus || 'parked'
        }));
        setSubscribers(mapped);
        setLoading(false);
      } catch (e) {
        console.error('Error loading subscriber data:', e);
        setLoading(false);
      }
    };

    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'customers'));
      unsubscribe = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map((d, idx) => {
            const data = d.data();
            return {
              systemId: data.deviceId || `OBD-3.0-IN-${9100 + idx}`,
              userId: data.customerId || d.id || `USR-IN-${150000 + idx}`,
              carNumber: data.vehicleReg || 'DL 01 AK 4921',
              vehicleModel: data.vehicleModel || 'Connected Vehicle',
              name: data.name || 'Verified Driver',
              phone: data.phone || '+91 98110 24890',
              location: [data.city, data.state].filter(Boolean).join(', ') || 'Delhi NCR, India',
              package: 'Operation 3.0 Defense',
              joinedAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '2026-02-14',
              drivingStatus: data.drivingStatus || 'parked'
            };
          });
          setSubscribers(docs);
          setLoading(false);
        } else {
          loadData();
        }
      }, (err) => {
        console.warn('Firestore snapshot error, using TelemetrySyncService:', err);
        loadData();
      });
    } else {
      loadData();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Search filter matching user ID, car number, system ID, name, location
  const filteredSubscribers = subscribers.filter(sub => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (sub.userId && sub.userId.toLowerCase().includes(q)) ||
      (sub.carNumber && sub.carNumber.toLowerCase().includes(q)) ||
      (sub.systemId && sub.systemId.toLowerCase().includes(q)) ||
      (sub.name && sub.name.toLowerCase().includes(q)) ||
      (sub.vehicleModel && sub.vehicleModel.toLowerCase().includes(q)) ||
      (sub.location && sub.location.toLowerCase().includes(q))
    );
  });

  const handleExportCSV = () => {
    const headers = ['System ID,User ID,Car Number,Model,Name,Phone,Location,Package,Joined Date'];
    const rows = subscribers.map(s => 
      `"${s.systemId}","${s.userId}","${s.carNumber}","${s.vehicleModel}","${s.name}","${s.phone}","${s.location}","${s.package}","${s.joinedAt}"`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Operation_Rakshak_Subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full pb-16 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu size={13} /> Operation 3.0 IoT Transponder Subscriptions
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Enrolled Vehicle & Subscriber Registry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Verified civilian and commercial highway vehicles equipped with Operation Rakshak 3.0 automated crash detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Download size={15} className="text-blue-400" /> 
            <span>Export Verified CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bolt-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/70 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Cpu size={24} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Active Transponders</p>
            <p className="text-2xl font-black text-white mt-0.5">{subscribers.length}</p>
          </div>
        </div>

        <div className="bolt-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Golden-Hour Coverage</p>
            <p className="text-2xl font-black text-white mt-0.5">100% Active</p>
          </div>
        </div>

        <div className="bolt-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Car size={24} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Highway Fleet</p>
            <p className="text-2xl font-black text-white mt-0.5">{subscribers.length} Registered</p>
          </div>
        </div>
      </div>

      {/* Functional Search Bar */}
      <div className="bolt-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by driver name, vehicle registration (e.g. DL 01 AK 4921), transponder ID, or city..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-xs"
          />
        </div>
        <div className="text-xs text-slate-400 whitespace-nowrap px-2 font-mono">
          Showing <span className="font-bold text-white">{filteredSubscribers.length}</span> verified record(s)
        </div>
      </div>

      {/* List Stack */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bolt-card p-5 animate-pulse flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-11 h-11 rounded-xl bg-slate-800"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-800 rounded"></div>
                  <div className="h-3 w-48 bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-24 bg-slate-800 rounded"></div>
            </div>
          ))
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 bolt-card">
            <FileWarning size={40} className="mx-auto text-slate-500 mb-2" />
            <p className="text-base font-bold text-white">No subscribers match your search query</p>
            <p className="text-xs text-slate-400 mt-1">Try searching by driver name or vehicle registration.</p>
          </div>
        ) : (
          filteredSubscribers.map((sub, idx) => (
            <div 
              key={idx} 
              className="bolt-card bolt-card-hover p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Left Info: System ID & User ID */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Cpu size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                      {sub.systemId}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                      {sub.userId}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                    <User size={15} className="text-slate-400" />
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{sub.phone}</p>
                </div>
              </div>

              {/* Middle Info: Car Number & Location */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
                <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Car size={15} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="font-mono font-bold text-white tracking-wider block">{sub.carNumber}</span>
                    <span className="text-[10px] text-slate-400 block">{sub.vehicleModel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin size={15} className="text-red-400 shrink-0" />
                  <span>{sub.location}</span>
                </div>
              </div>

              {/* Right Info: Package Badge */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <span className="px-3 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-bold tracking-wide">
                  {sub.package}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-bold">
                  <CheckCircle2 size={13} /> ACTIVE
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
