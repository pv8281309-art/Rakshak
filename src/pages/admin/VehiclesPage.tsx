import React, { useState, useEffect } from 'react';
import { Search, Filter, Car, AlertTriangle, CheckCircle, WifiOff, Cpu, RefreshCw, Radio } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TelemetrySyncService } from '../../services/TelemetrySyncService';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadVehicles = () => {
    try {
      TelemetrySyncService.initialize();
      const customers = TelemetrySyncService.getCustomers();
      const mapped = customers.map((c: any, idx: number) => ({
        id: `VEH-2026-${9100 + idx}`,
        owner: c.name,
        regNo: c.vehicleReg,
        model: c.vehicleModel || 'Tata Safari Gold Edition',
        device: c.deviceId || `OBD-3.0-IN-${9100 + idx}`,
        status: c.drivingStatus === 'driving' ? 'online' : 'standby',
        risk: idx === 0 ? 'medium' : 'low',
        lastConn: idx === 0 ? 'Just now (Telemetry Active)' : `${idx * 4 + 2} min ago`,
        location: `${c.city}, ${c.state}`
      }));
      setVehicles(mapped);
      setLoading(false);
    } catch (e) {
      console.error('Error loading vehicles:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();

    let unsub: any = null;
    if (isFirebaseConfigured && db) {
      unsub = onSnapshot(query(collection(db, 'customers')), () => {
        loadVehicles();
      }, () => loadVehicles());
    }

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.regNo.toLowerCase().includes(q) ||
      v.owner.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.device.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full space-y-6 font-sans max-w-7xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio size={13} /> High-Speed Highway Transponder Grid
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Connected Vehicle Fleet</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time OBD-II telematics, crash impact sensors, and CAN-bus telemetry.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-white font-bold">{vehicles.length}</span> Monitored Units
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicles by registration (e.g. DL 01 AK 4921), owner, or model..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Vehicle Table with Bolt Card Style */}
      <div className="bolt-card rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Vehicle & Registration</th>
                <th className="p-4">Subscriber Owner</th>
                <th className="p-4">Transponder Unit</th>
                <th className="p-4">Telemetry Connection</th>
                <th className="p-4">Risk Profile</th>
                <th className="p-4 text-right">Highway Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading connected transponders...</td></tr>
              ) : filteredVehicles.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No vehicles match this search filter.</td></tr>
              ) : filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Car size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white tracking-wider bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 font-mono inline-block">
                          {vehicle.regNo}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{vehicle.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-white">{vehicle.owner}</div>
                    <div className="text-[11px] text-slate-400">{vehicle.location}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-mono text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 inline-block font-bold">
                      {vehicle.device}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {vehicle.status === 'online' ? (
                        <CheckCircle size={14} className="text-emerald-400" />
                      ) : (
                        <Radio size={14} className="text-amber-400" />
                      )}
                      <div>
                        <div className={cn(
                          "text-xs font-bold uppercase",
                          vehicle.status === 'online' ? "text-emerald-400" : "text-amber-400"
                        )}>
                          {vehicle.status}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{vehicle.lastConn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                      vehicle.risk === 'low' ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30" :
                      vehicle.risk === 'medium' ? "bg-amber-950/80 text-amber-400 border-amber-500/30" : "bg-red-950/80 text-red-400 border-red-500/30"
                    )}>
                      {vehicle.risk} RISK
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1.5 text-xs font-bold text-blue-400 border border-blue-500/30 bg-blue-950/50 rounded-lg hover:bg-blue-900/60 transition-colors shadow-xs">
                      LIVE STREAM
                    </button>
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

export default VehiclesPage;
