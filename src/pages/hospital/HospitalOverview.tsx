import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  Users, 
  Ambulance, 
  BedDouble, 
  Droplet, 
  Activity, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  Radio, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Flame,
  Building2,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const HospitalOverview: React.FC = () => {
  const navigate = useNavigate();
  const { 
    hospitalId, 
    hospital, 
    beds, 
    bloodBank, 
    incomingPatients, 
    activeEmergencies, 
    commandMessages, 
    kpis, 
    lastTelemetryUpdate,
    loading 
  } = useHospital();

  const criticalPatients = incomingPatients.filter(p => p.severity === 'CRITICAL');
  const recentMessages = commandMessages.slice(0, 3);

  // Blood bank quick status calculation
  let bloodOverallStatus: 'AVAILABLE' | 'LOW' | 'CRITICAL' = 'AVAILABLE';
  if (kpis.bloodCriticalCount > 0) {
    bloodOverallStatus = 'CRITICAL';
  } else if (kpis.bloodLowCount > 0) {
    bloodOverallStatus = 'LOW';
  }

  // Format telemetry timestamp
  const telemetryTime = lastTelemetryUpdate 
    ? lastTelemetryUpdate.toLocaleTimeString('en-IN', { hour12: false }) 
    : 'Live';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER GREETING & STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Facility ID: {hospitalId} • Operational
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {hospital?.hospitalName || 'Emergency Response Center'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time trauma intake, ambulance telemetry, bed capacity, and command center coordination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/hospital/command-center')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Radio className="w-4 h-4" />
            <span>Command Center</span>
          </button>
          <button
            onClick={() => navigate('/hospital/incoming')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Incoming Patients ({incomingPatients.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS (Phase 3 Rules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Critical Incoming Patients */}
        <div 
          onClick={() => navigate('/hospital/incoming')}
          className={cn(
            "p-5 rounded-2xl border transition-all duration-200 cursor-pointer group",
            kpis.criticalIncoming > 0 
              ? "bg-red-950/30 border-red-800/60 hover:border-red-600 shadow-lg shadow-red-950/40" 
              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Incoming</span>
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
              kpis.criticalIncoming > 0 ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-400"
            )}>
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={cn(
              "text-3xl font-black tracking-tight",
              kpis.criticalIncoming > 0 ? "text-red-400" : "text-white"
            )}>
              {kpis.criticalIncoming}
            </span>
            <span className="text-xs text-slate-400 font-medium">Patients</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Requires Trauma Bay Prep</span>
            <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">View &rarr;</span>
          </div>
        </div>

        {/* 2. Incoming Ambulances */}
        <div 
          onClick={() => navigate('/hospital/ambulances')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incoming Ambulances</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Ambulance className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {kpis.incomingAmbulances}
            </span>
            <span className="text-xs text-cyan-400 font-medium">En Route</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Live GPS Telemetry</span>
            <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">Track &rarr;</span>
          </div>
        </div>

        {/* 3. Available Beds & Occupancy */}
        <div 
          onClick={() => navigate('/hospital/beds')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Beds</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 tracking-tight">
              {kpis.availableBeds}
            </span>
            <span className="text-xs text-slate-400">/ {kpis.totalBeds} total</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>{kpis.occupancyRate}% Occupied</span>
            <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">Manage &rarr;</span>
          </div>
        </div>

        {/* 4. ICU Beds Available */}
        <div 
          onClick={() => navigate('/hospital/beds')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ICU Beds</span>
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center",
              kpis.availableIcuBeds <= 2 ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/10 text-blue-400"
            )}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={cn(
              "text-3xl font-black tracking-tight",
              kpis.availableIcuBeds <= 2 ? "text-amber-400" : "text-white"
            )}>
              {kpis.availableIcuBeds}
            </span>
            <span className="text-xs text-slate-400">/ {kpis.totalIcuBeds} ICU Beds</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>{kpis.availableIcuBeds <= 2 ? 'Capacity Constrained' : 'Optimal Capacity'}</span>
            <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">View &rarr;</span>
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: Blood Status, Patients Today, Active Emergencies */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Blood Bank Quick Status */}
        <div 
          onClick={() => navigate('/hospital/blood-bank')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              bloodOverallStatus === 'CRITICAL' ? "bg-red-500/20 text-red-400" :
              bloodOverallStatus === 'LOW' ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
            )}>
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block">Blood Bank</span>
              <span className={cn(
                "text-sm font-bold",
                bloodOverallStatus === 'CRITICAL' ? "text-red-400" :
                bloodOverallStatus === 'LOW' ? "text-amber-400" : "text-emerald-400"
              )}>
                {bloodOverallStatus === 'CRITICAL' ? 'Critical Shortage' : bloodOverallStatus === 'LOW' ? 'Low Stock Warning' : 'Normal Inventory'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        {/* Patients Received Today */}
        <div 
          onClick={() => navigate('/hospital/patients')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block">Patients Today</span>
              <span className="text-sm font-bold text-white">
                {kpis.patientsToday} Emergency Cases
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        {/* Active Emergencies */}
        <div 
          onClick={() => navigate('/hospital/queue')}
          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase block">Active Emergencies</span>
              <span className="text-sm font-bold text-white">
                {kpis.activeEmergencies} In Progress
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      {/* COMPACT HOSPITAL RESOURCE STATUS SECTION (Rule 10) */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Hospital Resource Status (Real-time)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Last Updated: {telemetryTime} IST
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* General Beds */}
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>General Beds</span>
            </div>
            <div className="text-base font-bold text-white">
              {beds?.general?.available ?? 12} <span className="text-xs font-normal text-slate-400">Available</span>
            </div>
          </div>

          {/* ICU Beds */}
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className={cn(
                "w-2 h-2 rounded-full",
                (beds?.icu?.available ?? 3) <= 2 ? "bg-amber-400" : "bg-emerald-400"
              )}></span>
              <span>ICU Beds</span>
            </div>
            <div className="text-base font-bold text-white">
              {beds?.icu?.available ?? 3} <span className="text-xs font-normal text-slate-400">Available</span>
            </div>
          </div>

          {/* Emergency Beds */}
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className={cn(
                "w-2 h-2 rounded-full",
                (beds?.emergency?.available ?? 4) <= 2 ? "bg-red-400" : "bg-emerald-400"
              )}></span>
              <span>Emergency Beds</span>
            </div>
            <div className="text-base font-bold text-white">
              {beds?.emergency?.available ?? 4} <span className="text-xs font-normal text-slate-400">Available</span>
            </div>
          </div>

          {/* Blood Bank */}
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className={cn(
                "w-2 h-2 rounded-full",
                bloodOverallStatus === 'CRITICAL' ? "bg-red-400" :
                bloodOverallStatus === 'LOW' ? "bg-amber-400" : "bg-emerald-400"
              )}></span>
              <span>Blood Bank</span>
            </div>
            <div className={cn(
              "text-sm font-bold truncate",
              bloodOverallStatus === 'CRITICAL' ? "text-red-400" :
              bloodOverallStatus === 'LOW' ? "text-amber-400" : "text-emerald-400"
            )}>
              {bloodOverallStatus}
            </div>
          </div>

          {/* Ambulances */}
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Ambulances</span>
            </div>
            <div className="text-base font-bold text-white">
              {hospital?.ambulances?.available ?? 4} <span className="text-xs font-normal text-slate-400">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: INCOMING PATIENTS LIST + COMMAND CENTER PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: INCOMING PATIENTS PREVIEW */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Incoming Patients ({incomingPatients.length})
              </h2>
            </div>
            <button
              onClick={() => navigate('/hospital/incoming')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {incomingPatients.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No incoming patients currently assigned</p>
              <p className="text-xs text-slate-500 mt-1">
                When Admin dispatches an emergency case to this hospital, it will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingPatients.slice(0, 4).map((patient) => {
                const isCritical = patient.severity === 'CRITICAL';
                return (
                  <div
                    key={patient.id}
                    onClick={() => navigate('/hospital/incoming')}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.005]",
                      isCritical 
                        ? "bg-red-950/20 border-red-800/60 hover:border-red-600" 
                        : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2.5 py-1 text-[10px] font-black uppercase rounded tracking-wider",
                          isCritical ? "bg-red-600 text-white animate-pulse" :
                          patient.severity === 'HIGH' ? "bg-orange-500 text-white" :
                          patient.severity === 'MEDIUM' ? "bg-amber-500 text-black" : "bg-emerald-500 text-black"
                        )}>
                          {patient.severity}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{patient.patientName}</span>
                            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/50">
                              {patient.patientId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-sm mt-0.5">
                            {patient.condition}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">ETA</span>
                          <span className="text-sm font-black text-cyan-400 font-mono">{patient.eta}</span>
                        </div>
                        <div className="text-right pl-3 border-l border-slate-700">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Ambulance</span>
                          <span className="text-xs font-semibold text-slate-200">{patient.ambulanceId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {patient.location}
                      </span>
                      <span className="text-slate-300 font-medium">
                        Dept: <span className="text-cyan-400">{patient.department}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: COMMAND CENTER MESSAGES PREVIEW */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Command Center
                </h2>
              </div>
              <button
                onClick={() => navigate('/hospital/command-center')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Chat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Direct two-way tactical link with Operation Rakshak State Dispatch.
            </p>

            <div className="space-y-2.5">
              {recentMessages.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-800/30 rounded-xl border border-slate-800">
                  No recent command messages.
                </div>
              ) : (
                recentMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    onClick={() => navigate('/hospital/command-center')}
                    className="p-3 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                        msg.senderRole === 'ADMIN' ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-700 text-slate-300"
                      )}>
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => navigate('/hospital/command-center')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Open Two-Way Conversation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
