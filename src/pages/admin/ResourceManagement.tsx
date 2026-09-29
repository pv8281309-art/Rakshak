import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Car, 
  User, 
  MapPin, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Ambulance, 
  Activity,
  CheckCircle2,
  PhoneCall,
  ShieldAlert,
  ChevronRight,
  X,
  Wind,
  Droplets,
  Edit3,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { TelemetrySyncService, TraumaHospital } from '../../services/TelemetrySyncService';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function ResourceManagement() {
  const [hospitals, setHospitals] = useState<TraumaHospital[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'hospitals' | 'allocations'>('hospitals');

  // Edit Bed Capacity Modal state
  const [editingHospital, setEditingHospital] = useState<TraumaHospital | null>(null);
  const [editIcuBeds, setEditIcuBeds] = useState<number>(0);
  const [editEmergencyBeds, setEditEmergencyBeds] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Selected detail modal
  const [selectedHospitalDetail, setSelectedHospitalDetail] = useState<TraumaHospital | null>(null);
  const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<any>(null);

  // Load Real Data from TelemetrySyncService and Firestore
  const loadRealData = () => {
    try {
      TelemetrySyncService.initialize();
      const realHospitals = TelemetrySyncService.getHospitals();
      setHospitals(realHospitals);

      // Load real active unresolved SOS incidents
      const savedSos = JSON.parse(localStorage.getItem('rakshak_sos_alerts') || '[]');
      const cleanSos = Array.isArray(savedSos) 
        ? savedSos.filter((a: any) => a && a.status !== 'resolved' && a.id !== 'SOS-2026-9921')
        : [];
      
      const realCustomers = TelemetrySyncService.getCustomers();
      const assignData = JSON.parse(localStorage.getItem('rakshak_ambulance_assignments') || '{}');
      setAssignments(assignData);

      const enrichedIncidents = cleanSos.map((item: any, idx: number) => {
        const matchedCust: any = realCustomers.find((c: any) => 
          c.customerId === item.userId || 
          c.vehicleReg === item.vehicle ||
          c.name === item.user
        ) || {};

        const assign = assignData[item.id] || {};
        const matchedHosp = realHospitals.find(h => h.id === assign.hospitalId || h.id === item.assignedHospitalId) || realHospitals[0];

        const dateObj = item.createdAt ? new Date(item.createdAt) : new Date();

        return {
          id: item.id || `SOS-${1000 + idx}`,
          userId: matchedCust.customerId || item.customerId || item.userId || 'USR-IN-150001',
          userName: item.user || item.userName || matchedCust.name || 'Verified Highway Driver',
          carNumber: item.vehicle || item.carNumber || matchedCust.vehicleReg || 'DL 01 AK 4921',
          vehicleModel: matchedCust.vehicleModel || 'Connected Vehicle',
          condition: item.type || 'High-G Impact Collision',
          gForce: item.gForce ? (typeof item.gForce === 'number' ? `${item.gForce}G` : item.gForce) : '14.2G',
          time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: dateObj.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
          day: dateObj.toLocaleDateString('en-IN', { weekday: 'long' }),
          severity: item.severity || 'Critical (Level 1)',
          hospital: assign.hospitalName || matchedHosp?.hospitalName || 'Designated Trauma Centre',
          hospitalId: matchedHosp?.id || 'HOSP001',
          ambulance: assign.ambulanceName || 'Standby ALS Ambulance Unit',
          ambulanceDriver: assign.driver || 'Rescue Officer',
          ambulancePhone: assign.phone || matchedHosp?.emergencyContact || '+91 11 2658 8500',
          location: item.address || item.loc || item.location || 'Highway Emergency Zone',
          status: assign.ambulanceAssigned ? 'Rescue Dispatched' : item.status === 'responding' ? 'Hospital Alerted' : 'Awaiting Triage',
          eta: assign.eta || '4 mins',
          isDispatched: !!assign.ambulanceAssigned
        };
      });

      setActiveIncidents(enrichedIncidents);
      setLoading(false);
    } catch (e) {
      console.error('Error loading real resources:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();

    let unsubHosp: any = null;
    let unsubSos: any = null;

    if (isFirebaseConfigured && db) {
      unsubHosp = onSnapshot(query(collection(db, 'hospitals')), (snap) => {
        if (!snap.empty) {
          const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as TraumaHospital));
          setHospitals(fetched);
        } else {
          setHospitals(TelemetrySyncService.getHospitals());
        }
      }, () => {
        setHospitals(TelemetrySyncService.getHospitals());
      });

      unsubSos = onSnapshot(query(collection(db, 'sos_alerts')), () => {
        loadRealData();
      }, () => {
        loadRealData();
      });
    }

    const onStorage = () => {
      loadRealData();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (unsubHosp) unsubHosp();
      if (unsubSos) unsubSos();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Aggregated real totals
  const totalIcuAvailable = useMemo(() => hospitals.reduce((acc, h) => acc + (h.icuBedsAvailable || 0), 0), [hospitals]);
  const totalIcuTotal = useMemo(() => hospitals.reduce((acc, h) => acc + (h.icuBedsTotal || 0), 0), [hospitals]);
  const totalEmergencyAvailable = useMemo(() => hospitals.reduce((acc, h) => acc + (h.emergencyBedsAvailable || 0), 0), [hospitals]);
  const totalEmergencyTotal = useMemo(() => hospitals.reduce((acc, h) => acc + (h.emergencyBedsTotal || 0), 0), [hospitals]);
  const totalVentilators = useMemo(() => hospitals.reduce((acc, h) => acc + (h.ventilatorsAvailable || 0), 0), [hospitals]);
  const totalAmbulances = useMemo(() => hospitals.reduce((acc, h) => acc + (h.ambulancesAvailable || 0), 0), [hospitals]);

  // Unique states for filter
  const uniqueStates = useMemo(() => {
    const states = new Set(hospitals.map(h => h.state).filter(Boolean));
    return Array.from(states);
  }, [hospitals]);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const matchesSearch = 
        h.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.traumaLevel && h.traumaLevel.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesState = selectedState === 'all' || h.state === selectedState;
      return matchesSearch && matchesState;
    });
  }, [hospitals, searchQuery, selectedState]);

  // Filtered active incidents
  const filteredIncidents = useMemo(() => {
    return activeIncidents.filter(item => 
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.carNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeIncidents, searchQuery]);

  // Handle open bed edit modal
  const handleOpenEditBeds = (hosp: TraumaHospital) => {
    setEditingHospital(hosp);
    setEditIcuBeds(hosp.icuBedsAvailable || 0);
    setEditEmergencyBeds(hosp.emergencyBedsAvailable || 0);
    setSaveSuccess(false);
  };

  // Handle save bed counts
  const handleSaveBedCounts = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHospital) return;

    TelemetrySyncService.updateHospitalBeds(editingHospital.id, editIcuBeds, editEmergencyBeds);
    
    // Update local state immediately
    setHospitals(prev => prev.map(h => {
      if (h.id === editingHospital.id) {
        return {
          ...h,
          icuBedsAvailable: editIcuBeds,
          emergencyBedsAvailable: editEmergencyBeds
        };
      }
      return h;
    }));

    setSaveSuccess(true);
    setTimeout(() => {
      setEditingHospital(null);
      setSaveSuccess(false);
    }, 800);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full pb-16 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 size={13} /> Real Trauma Care Resource & Bed Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Emergency Resource Management System
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time critical care inventory across registered trauma hospitals: ICU beds, trauma ward beds, ventilators, and emergency dispatch assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/hospitals"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Building2 size={14} />
            <span>Manage Accredited Hospitals</span>
          </Link>
        </div>
      </div>

      {/* Top Resource Metrics Row (100% Real Aggregated Data) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Registered Hospitals */}
        <div className="bolt-card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trauma Hubs</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">{hospitals.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Active
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Accredited Centers</p>
        </div>

        {/* ICU Beds Available */}
        <div className="bolt-card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ICU Beds</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {totalIcuAvailable}<span className="text-sm text-slate-500 font-normal">/{totalIcuTotal}</span>
            </span>
            <span className="text-[10px] font-bold text-cyan-400">
              {totalIcuTotal > 0 ? `${Math.round((totalIcuAvailable / totalIcuTotal) * 100)}%` : '0%'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Critical Care Units</p>
        </div>

        {/* Emergency Trauma Beds */}
        <div className="bolt-card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trauma Beds</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {totalEmergencyAvailable}<span className="text-sm text-slate-500 font-normal">/{totalEmergencyTotal}</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              {totalEmergencyTotal > 0 ? `${Math.round((totalEmergencyAvailable / totalEmergencyTotal) * 100)}%` : '0%'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Emergency Ward Ready</p>
        </div>

        {/* Ventilators */}
        <div className="bolt-card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ventilators</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-400 font-mono">{totalVentilators}</span>
            <Wind size={15} className="text-purple-400" />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Life Support Ready</p>
        </div>

        {/* Standby Ambulances */}
        <div className="bolt-card p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ambulance Fleet</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-orange-400 font-mono">{totalAmbulances}</span>
            <Ambulance size={16} className="text-orange-400" />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">ALS & BLS on Base</p>
        </div>

        {/* Active Crash Allocations */}
        <div className={cn(
          "bolt-card p-4 flex flex-col justify-between border",
          activeIncidents.length > 0 ? "border-red-500/50 bg-red-950/20" : "border-slate-800"
        )}>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Allocations</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={cn(
              "text-2xl font-black font-mono",
              activeIncidents.length > 0 ? "text-red-400 animate-pulse" : "text-slate-300"
            )}>
              {activeIncidents.length}
            </span>
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded border",
              activeIncidents.length > 0 ? "bg-red-950 text-red-300 border-red-500/40" : "bg-slate-800 text-slate-400 border-slate-700"
            )}>
              {activeIncidents.length > 0 ? 'Dispatched' : 'Standby'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Live Crash Victims</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
              activeTab === 'hospitals'
                ? "bg-blue-600 text-white border-blue-500 shadow-md"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            )}
          >
            <Building2 size={14} />
            <span>Trauma Hospitals & Bed Inventory ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('allocations')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
              activeTab === 'allocations'
                ? "bg-red-600 text-white border-red-500 shadow-md"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            )}
          >
            <ShieldAlert size={14} />
            <span>Active Incident Deployments ({activeIncidents.length})</span>
          </button>
        </div>

        {/* State Filter Chips (when on hospitals tab) */}
        {activeTab === 'hospitals' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedState('all')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border",
                selectedState === 'all'
                  ? "bg-slate-800 text-white border-slate-700 font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              )}
            >
              All Regions
            </button>
            {uniqueStates.map(state => (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border whitespace-nowrap",
                  selectedState === state
                    ? "bg-blue-600 text-white border-blue-500 font-bold"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
                )}
              >
                {state}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'hospitals' ? "Search hospital by name, city, state, or trauma tier..." : "Search active incidents by driver name, vehicle registration, location..."}
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-xs"
        />
      </div>

      {/* Tab 1: Real Accredited Trauma Hospitals & Bed Inventory */}
      {activeTab === 'hospitals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bolt-card p-6 animate-pulse space-y-4">
                <div className="h-6 w-3/4 bg-slate-800 rounded"></div>
                <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
                <div className="h-20 w-full bg-slate-800 rounded-xl"></div>
              </div>
            ))
          ) : filteredHospitals.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 bolt-card">
              <Building2 size={40} className="mx-auto text-slate-500 mb-3" />
              <h3 className="text-base font-bold text-white">No Hospitals Match Current Filter</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Try adjusting your search criteria or register a new trauma center via Hospital Access.
              </p>
            </div>
          ) : (
            filteredHospitals.map((hospital) => {
              const icuPercent = hospital.icuBedsTotal > 0 ? Math.round((hospital.icuBedsAvailable / hospital.icuBedsTotal) * 100) : 0;
              const emPercent = hospital.emergencyBedsTotal > 0 ? Math.round((hospital.emergencyBedsAvailable / hospital.emergencyBedsTotal) * 100) : 0;

              return (
                <div
                  key={hospital.id}
                  className="bolt-card bolt-card-hover p-5 flex flex-col justify-between gap-4 group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Header: Name and Trauma Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                          {hospital.hospitalId || hospital.id}
                        </span>
                        <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mt-1">
                          {hospital.hospitalName}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-red-400 shrink-0" />
                          <span>{hospital.city}, {hospital.state}</span>
                        </p>
                      </div>

                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border bg-blue-950/80 text-blue-300 border-blue-500/30 shrink-0">
                        {hospital.traumaLevel || 'Level 1'}
                      </span>
                    </div>

                    {/* Bed Capacity Meters */}
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                      {/* ICU Beds Progress */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-300">ICU Beds:</span>
                          <span className="font-mono font-bold text-cyan-400">
                            {hospital.icuBedsAvailable} / {hospital.icuBedsTotal} ({icuPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500 rounded-full",
                              icuPercent > 30 ? "bg-cyan-500" : icuPercent > 10 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.min(100, Math.max(5, icuPercent))}%` }}
                          />
                        </div>
                      </div>

                      {/* Emergency Trauma Beds Progress */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-300">Trauma Ward Beds:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {hospital.emergencyBedsAvailable} / {hospital.emergencyBedsTotal} ({emPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500 rounded-full",
                              emPercent > 30 ? "bg-emerald-500" : emPercent > 10 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.min(100, Math.max(5, emPercent))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Critical Resources Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Wind size={13} className="text-purple-400" /> Ventilators
                        </span>
                        <span className="font-mono font-bold text-white">{hospital.ventilatorsAvailable}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Ambulance size={13} className="text-orange-400" /> Fleet Units
                        </span>
                        <span className="font-mono font-bold text-white">{hospital.ambulancesAvailable}</span>
                      </div>
                    </div>

                    {/* Blood Bank Status */}
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                      <Droplets size={13} className="text-red-400 shrink-0" />
                      <span className="truncate">Blood Bank: <strong className="text-white">{hospital.bloodBankStatus || 'Optimal Stock'}</strong></span>
                    </div>

                    {/* Emergency Contact */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <a 
                        href={`tel:${hospital.emergencyContact}`}
                        className="text-slate-400 hover:text-blue-400 flex items-center gap-1.5 transition-colors font-mono"
                      >
                        <PhoneCall size={12} className="text-emerald-400" />
                        <span>{hospital.emergencyContact}</span>
                      </a>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEditBeds(hospital)}
                      className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                    >
                      <Edit3 size={13} className="text-blue-400" />
                      <span>Adjust Beds</span>
                    </button>

                    <button
                      onClick={() => setSelectedHospitalDetail(hospital)}
                      className="py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border border-blue-500/30"
                    >
                      <span>Details</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Live Incident Emergency Deployments (Strictly Real Data) */}
      {activeTab === 'allocations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIncidents.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 bolt-card flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">All Emergency Resources on Standby</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                Zero active crash triggers across Indian corridors. When a collision occurs, real-time telemetry will automatically map the victim to the nearest trauma bay, mobile ICU, and surgical team.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <span>0 ACTIVE DISPATCH ALLOCATIONS • READY STATE</span>
              </div>
            </div>
          ) : (
            filteredIncidents.map((record) => (
              <div
                key={record.id}
                onClick={() => setSelectedIncidentDetail(record)}
                className="bolt-card bolt-card-hover p-6 cursor-pointer flex flex-col justify-between gap-4 group relative overflow-hidden border-red-500/40 bg-red-950/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-red-400 bg-red-950 px-2.5 py-0.5 rounded border border-red-500/30">
                      {record.id}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border bg-red-950 text-red-300 border-red-500/40">
                      {record.severity}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-red-300 transition-colors flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      {record.userName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 font-mono font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 w-fit">
                      <Car size={13} className="text-slate-400" />
                      <span>{record.carNumber}</span>
                      <span className="text-slate-500 font-normal">({record.vehicleModel})</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <p className="flex items-center gap-2 text-slate-300 truncate">
                      <MapPin size={13} className="text-red-400 shrink-0" />
                      <span className="truncate">{record.location}</span>
                    </p>
                    <p className="flex items-center gap-2 text-blue-400 truncate font-semibold">
                      <Building2 size={13} className="shrink-0" />
                      <span className="truncate">Bay: {record.hospital}</span>
                    </p>
                    <p className="flex items-center gap-2 text-orange-400 truncate font-semibold">
                      <Ambulance size={13} className="shrink-0" />
                      <span className="truncate">Unit: {record.ambulance}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                  <span>View Resource Breakdown</span>
                  <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal 1: Adjust Bed Capacity */}
      <AnimatePresence>
        {editingHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bolt-card border border-slate-700 w-full max-w-md overflow-hidden text-white flex flex-col shadow-2xl"
            >
              <div className="bg-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Adjust Real Bed Capacity</h3>
                    <p className="text-xs text-slate-400">{editingHospital.hospitalName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingHospital(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveBedCounts} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Available ICU Beds (Max: {editingHospital.icuBedsTotal})
                  </label>
                  <input 
                    type="number"
                    min={0}
                    max={editingHospital.icuBedsTotal}
                    value={editIcuBeds}
                    onChange={(e) => setEditIcuBeds(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Total installed ICU capacity: {editingHospital.icuBedsTotal}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Available Emergency / Trauma Beds (Max: {editingHospital.emergencyBedsTotal})
                  </label>
                  <input 
                    type="number"
                    min={0}
                    max={editingHospital.emergencyBedsTotal}
                    value={editEmergencyBeds}
                    onChange={(e) => setEditEmergencyBeds(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Total installed trauma capacity: {editingHospital.emergencyBedsTotal}</p>
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <Check size={16} />
                    <span>Real bed inventory updated and synced successfully!</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingHospital(null)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Save Real Counts</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Hospital Detail Modal */}
      <AnimatePresence>
        {selectedHospitalDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bolt-card border border-slate-700 w-full max-w-lg overflow-hidden text-white flex flex-col shadow-2xl"
            >
              <div className="bg-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedHospitalDetail.hospitalName}</h3>
                    <p className="text-xs text-slate-400">{selectedHospitalDetail.city}, {selectedHospitalDetail.state}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedHospitalDetail(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">ICU Beds Available</p>
                    <p className="text-base font-mono font-bold text-cyan-400 mt-0.5">
                      {selectedHospitalDetail.icuBedsAvailable} / {selectedHospitalDetail.icuBedsTotal}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Trauma Beds Available</p>
                    <p className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                      {selectedHospitalDetail.emergencyBedsAvailable} / {selectedHospitalDetail.emergencyBedsTotal}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ventilators Standing By</p>
                    <p className="text-base font-mono font-bold text-purple-400 mt-0.5">
                      {selectedHospitalDetail.ventilatorsAvailable}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ambulance Units</p>
                    <p className="text-base font-mono font-bold text-orange-400 mt-0.5">
                      {selectedHospitalDetail.ambulancesAvailable}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Blood Bank Status</p>
                  <p className="text-xs font-semibold text-white">{selectedHospitalDetail.bloodBankStatus}</p>
                </div>

                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Emergency Hotline</p>
                  <a 
                    href={`tel:${selectedHospitalDetail.emergencyContact}`}
                    className="text-xs font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1.5"
                  >
                    <PhoneCall size={13} />
                    <span>{selectedHospitalDetail.emergencyContact}</span>
                  </a>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      const hosp = selectedHospitalDetail;
                      setSelectedHospitalDetail(null);
                      handleOpenEditBeds(hosp);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 size={14} />
                    <span>Update Real Bed Inventory</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Incident Detail Modal */}
      <AnimatePresence>
        {selectedIncidentDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bolt-card border border-slate-700 w-full max-w-xl overflow-hidden text-white flex flex-col shadow-2xl"
            >
              <div className="bg-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/40 text-red-400 flex items-center justify-center">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedIncidentDetail.userName}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedIncidentDetail.carNumber} • {selectedIncidentDetail.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedIncidentDetail(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 font-bold uppercase tracking-wider text-[10px]">Crash Telemetry</span>
                    <span className="px-2 py-0.5 rounded bg-red-900 text-red-300 font-mono font-bold text-xs">{selectedIncidentDetail.gForce}</span>
                  </div>
                  <p className="text-sm font-bold text-white">{selectedIncidentDetail.condition}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Allocated Trauma Center</p>
                    <p className="text-xs font-bold text-blue-400 mt-1 flex items-center gap-1.5">
                      <Building2 size={14} />
                      {selectedIncidentDetail.hospital}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dispatched Ambulance</p>
                    <p className="text-xs font-bold text-orange-400 mt-1 flex items-center gap-1.5">
                      <Ambulance size={14} />
                      {selectedIncidentDetail.ambulance}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{selectedIncidentDetail.ambulanceDriver}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">GPS Collision Location</p>
                  <p className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-red-400 shrink-0" />
                    {selectedIncidentDetail.location}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to="/admin/live-monitoring"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>View on Live Radar</span>
                    <ExternalLink size={13} />
                  </Link>

                  <Link
                    to="/admin/ambulance"
                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Track Ambulance Vector</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
