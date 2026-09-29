import React, { useState } from 'react';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Gauge, 
  Clock, 
  AlertTriangle, 
  Ambulance, 
  CheckCircle2, 
  Activity, 
  Phone, 
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmergencySeverity, PatientAdmissionStatus } from '../../types/hospital';
import { EmergencyService } from '../../services/EmergencyService';

export const IncomingPatients: React.FC = () => {
  const { incomingPatients, updatePatientStatus, hospitalId } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [acknowledgingIds, setAcknowledgingIds] = useState<Record<string, boolean>>({});

  const handleAcknowledge = async (incidentId: string) => {
    setAcknowledgingIds(prev => ({ ...prev, [incidentId]: true }));
    try {
      await EmergencyService.acknowledgeEmergency(incidentId, hospitalId);
    } catch (e: any) {
      console.error(e);
      alert('Failed to acknowledge emergency: ' + e.message);
    } finally {
      setAcknowledgingIds(prev => ({ ...prev, [incidentId]: false }));
    }
  };

  // Filter incoming
  const filteredPatients = incomingPatients.filter(patient => {
    const matchesSearch = 
      patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.incidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.ambulanceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || patient.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const handleStatusAdvance = async (patient: any, nextStatus: PatientAdmissionStatus) => {
    setActionLoading(true);
    try {
      await updatePatientStatus(
        patient.id, 
        nextStatus, 
        patient.department, 
        notesInput || patient.emergencyNotes
      );
      setSelectedPatient(null);
      setNotesInput('');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER & CONTROLS */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Trauma Bay Dispatch
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Incoming Emergency Patients ({incomingPatients.length})
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active ambulance transits assigned to this facility by Operation Rakshak State Emergency Control.
            </p>
          </div>

          {/* Operational Disclaimer (Rule 6) */}
          <div className="bg-slate-800/70 border border-slate-700/60 p-2.5 rounded-xl text-[11px] text-slate-300 max-w-md">
            <span className="font-bold text-amber-400 block mb-0.5">⚠️ Operational Notice</span>
            Operational emergency queue. Final clinical assessment remains with authorized hospital medical staff.
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Patient ID, Name, Incident ID, Ambulance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Severity Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap",
                  severityFilter === sev 
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20" 
                    : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60"
                )}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PATIENTS LIST */}
      {filteredPatients.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No incoming patients found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {searchTerm || severityFilter !== 'ALL' 
              ? 'No incoming emergencies matched your search criteria.' 
              : 'There are currently no active incoming emergency cases dispatched to this hospital.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPatients.map((patient) => {
            const isCritical = patient.severity === 'CRITICAL';
            return (
              <div
                key={patient.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all backdrop-blur-md",
                  isCritical 
                    ? "bg-gradient-to-r from-red-950/40 via-slate-900/80 to-slate-900/80 border-red-700/60 shadow-lg shadow-red-950/30" 
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Identity & Clinical Condition */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs uppercase flex-shrink-0 mt-0.5",
                      isCritical ? "bg-red-600 text-white animate-pulse" :
                      patient.severity === 'HIGH' ? "bg-orange-500 text-white" :
                      patient.severity === 'MEDIUM' ? "bg-amber-500 text-black" : "bg-emerald-500 text-black"
                    )}>
                      {patient.severity.slice(0, 4)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{patient.patientName}</h3>
                        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                          {patient.patientId}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Incident: {patient.incidentId}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-200">
                        {patient.type} &bull; <span className="text-slate-300 font-normal">{patient.condition}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                        {patient.gender && <span>Gender: {patient.gender}</span>}
                        {patient.age && <span>Age: {patient.age}</span>}
                        {patient.mobile && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {patient.mobile}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {patient.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Telemetry Data */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-center min-w-[280px]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">ETA</span>
                      <span className="text-base font-black text-cyan-400 font-mono">{patient.eta}</span>
                    </div>
                    <div className="border-x border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Ambulance</span>
                      <span className="text-xs font-bold text-white block truncate">{patient.ambulanceId}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate">{patient.ambulanceNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Speed</span>
                      <span className="text-xs font-bold text-slate-200 block">{patient.currentSpeed || 55} km/h</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {patient.hospitalAcknowledged === false && (
                      <button
                        onClick={() => handleAcknowledge(patient.incidentId)}
                        disabled={acknowledgingIds[patient.incidentId]}
                        className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-red-600/30 animate-pulse"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>{acknowledgingIds[patient.incidentId] ? 'Confirming...' : 'ACKNOWLEDGE EMERGENCY'}</span>
                      </button>
                    )}

                    {patient.hospitalAcknowledged === true && (
                      <span className="px-3 py-2 bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Acknowledged</span>
                      </span>
                    )}

                    {patient.admissionStatus === 'EN_ROUTE' && (
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-cyan-600/20"
                      >
                        <Activity className="w-4 h-4" />
                        <span>Prepare Bay</span>
                      </button>
                    )}

                    {patient.admissionStatus === 'ARRIVED' && (
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Handover & Triage</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors border border-slate-700"
                    >
                      <span>Full Case</span>
                    </button>
                  </div>
                </div>

                {/* BOTTOM METADATA BAR */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-300">Required Resources:</span>
                    {patient.requiredResources.map((res: string, i: number) => (
                      <span key={i} className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-cyan-300 border border-slate-700">
                        {res}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span>Assigned: {new Date(patient.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="font-semibold text-emerald-400 uppercase">
                      Status: {patient.ambulanceStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PATIENT DETAIL & WORKFLOW MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                  Emergency Incident {selectedPatient.incidentId}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  {selectedPatient.patientName} &bull; {selectedPatient.patientId}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Case Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Severity</span>
                <span className="text-red-400 font-bold text-sm">{selectedPatient.severity}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Ambulance</span>
                <span className="text-white font-bold">{selectedPatient.ambulanceId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Paramedic Contact</span>
                <span className="text-slate-200">{selectedPatient.driverPhone || 'Paramedic on Radio'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Department</span>
                <span className="text-cyan-400 font-medium">{selectedPatient.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current ETA</span>
                <span className="text-white font-bold">{selectedPatient.eta}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Speed</span>
                <span className="text-slate-200">{selectedPatient.currentSpeed || 60} km/h</span>
              </div>
            </div>

            {/* Emergency Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                Emergency Trauma & Triage Notes
              </label>
              <textarea
                rows={3}
                placeholder="Enter trauma bay preparation notes, clinical vitals received via paramedic radio, or special team instructions..."
                defaultValue={selectedPatient.emergencyNotes || ''}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Workflow Action Buttons (Rule 14) */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase block tracking-wider">
                Advance Patient Workflow (Authorized Staff Action)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {selectedPatient.admissionStatus === 'EN_ROUTE' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusAdvance(selectedPatient, 'ARRIVED')}
                    className="py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ambulance Arrived</span>
                  </button>
                )}

                {(selectedPatient.admissionStatus === 'EN_ROUTE' || selectedPatient.admissionStatus === 'ARRIVED') && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusAdvance(selectedPatient, 'HANDED_OVER')}
                    className="py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-4 h-4" />
                    <span>Patient Handed Over</span>
                  </button>
                )}

                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusAdvance(selectedPatient, 'ADMITTED')}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-4 h-4" />
                  <span>Admit to Hospital</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
