import React from 'react';
import { useEmergencyResponse } from '../../contexts/EmergencyResponseContext';
import { ShieldAlert, HeartPulse } from 'lucide-react';

export const EmergencyAlertBanner: React.FC = () => {
  const { unassignedIncidents, openEmergency } = useEmergencyResponse();

  const highestPriorityIncident = unassignedIncidents[0];

  return (
    <div className="w-full">
      {highestPriorityIncident ? (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-3 shadow-lg animate-in fade-in duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center animate-pulse flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider bg-white text-red-700 px-2 py-0.5 rounded shadow-sm">
                    CRITICAL EMERGENCY DETECTED ({unassignedIncidents.length} Pending)
                  </span>
                  <span className="text-xs font-mono font-bold bg-black/30 px-2 py-0.5 rounded">
                    {highestPriorityIncident.incidentId}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded">
                    {highestPriorityIncident.severity}
                  </span>
                </div>
                <p className="text-xs text-white/90 truncate max-w-xl mt-0.5">
                  Vehicle: <strong className="text-white font-mono">{highestPriorityIncident.vehicleId}</strong> &bull; Location: {highestPriorityIncident.locationText} &bull; Patient: {highestPriorityIncident.patientName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => openEmergency(highestPriorityIncident.incidentId)}
                className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <HeartPulse className="w-4 h-4 text-red-600" />
                <span>DISPATCH & ASSIGN HOSPITAL</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs text-slate-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Emergency Response Engine Active</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-slate-400">All Highway Sectors Monitored &bull; Telemetry Ingestion Ready</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
