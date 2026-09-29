import React, { useState } from 'react';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  ListOrdered, 
  AlertTriangle, 
  Clock, 
  Activity, 
  CheckCircle2, 
  ChevronRight, 
  ShieldAlert, 
  Stethoscope, 
  Ambulance, 
  BedDouble,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PatientAdmissionStatus } from '../../types/hospital';

export const EmergencyQueue: React.FC = () => {
  const { incomingPatients, activeEmergencies, updatePatientStatus } = useHospital();
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  // Operational Queue: sorted strictly by Severity (CRITICAL -> HIGH -> MEDIUM -> LOW) then ETA
  const queueCases = [...activeEmergencies].sort((a, b) => {
    const sOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const diff = (sOrder[a.severity] ?? 2) - (sOrder[b.severity] ?? 2);
    if (diff !== 0) return diff;
    return (a.admissionStatus === 'EN_ROUTE' ? 0 : 1) - (b.admissionStatus === 'EN_ROUTE' ? 0 : 1);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Priority Dispatch Queue
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Emergency Queue ({queueCases.length})
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Prioritized trauma pipeline based on incident severity, transit ETA, and required clinical department.
            </p>
          </div>

          {/* Operational Disclaimer (Rule 12) */}
          <div className="bg-slate-800/70 border border-slate-700/60 p-3 rounded-xl text-[11px] text-slate-300 max-w-md">
            <span className="font-bold text-amber-400 block mb-0.5">⚠️ Mandatory Clinical Disclaimer</span>
            Operational emergency queue. Not an automated medical triage system. Final clinical assessment remains with authorized hospital medical staff.
          </div>
        </div>
      </div>

      {/* QUEUE TABLE / LIST */}
      {queueCases.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Emergency Queue Clear</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No active emergency cases currently waiting in the hospital trauma intake queue.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {queueCases.map((item, index) => {
            const rank = index + 1;
            const isCritical = item.severity === 'CRITICAL';
            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4",
                  isCritical 
                    ? "bg-red-950/20 border-red-800/60 hover:border-red-600" 
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                )}
              >
                {/* Left: Rank & Patient Info */}
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border flex-shrink-0",
                    rank === 1 ? "bg-red-500/20 text-red-400 border-red-500/40" :
                    rank <= 3 ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-400 border-slate-700"
                  )}>
                    #{rank}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] font-black uppercase rounded tracking-wider",
                        isCritical ? "bg-red-600 text-white animate-pulse" :
                        item.severity === 'HIGH' ? "bg-orange-500 text-white" :
                        item.severity === 'MEDIUM' ? "bg-amber-500 text-black" : "bg-emerald-500 text-black"
                      )}>
                        {item.severity}
                      </span>
                      <h3 className="text-sm font-bold text-white">{item.patientName}</h3>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/50">
                        {item.patientId}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Incident: {item.incidentId}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Condition: <strong className="text-slate-200">{item.condition}</strong></span>
                      <span>Department: <strong className="text-cyan-400">{item.department}</strong></span>
                      <span>Ambulance: <strong className="text-slate-300">{item.ambulanceId}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Middle & Right: Status & Actions */}
                <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Stage / Status</span>
                    <span className={cn(
                      "text-xs font-bold uppercase",
                      item.admissionStatus === 'EN_ROUTE' ? "text-cyan-400 font-mono" :
                      item.admissionStatus === 'ARRIVED' ? "text-amber-400" :
                      item.admissionStatus === 'HANDED_OVER' ? "text-purple-400" : "text-emerald-400"
                    )}>
                      {item.admissionStatus.replace(/_/g, ' ')}
                      {item.admissionStatus === 'EN_ROUTE' && ` (${item.eta})`}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedCase(item)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Bay</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold">Priority Rank Case</span>
                <h2 className="text-lg font-bold text-white">{selectedCase.patientName} &bull; {selectedCase.patientId}</h2>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p><strong>Incident ID:</strong> {selectedCase.incidentId}</p>
              <p><strong>Condition:</strong> {selectedCase.condition}</p>
              <p><strong>Department:</strong> {selectedCase.department}</p>
              <p><strong>Ambulance:</strong> {selectedCase.ambulanceId} ({selectedCase.ambulanceNumber})</p>
              <p><strong>ETA:</strong> {selectedCase.eta}</p>
              <p><strong>Required Resources:</strong> {selectedCase.requiredResources.join(', ')}</p>
              {selectedCase.emergencyNotes && (
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 mt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Clinical Notes</span>
                  {selectedCase.emergencyNotes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
