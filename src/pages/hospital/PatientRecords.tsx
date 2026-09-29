import React, { useState } from 'react';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Activity, 
  ChevronRight, 
  Edit3, 
  Save, 
  X,
  MapPin,
  Ambulance,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PatientAdmissionStatus } from '../../types/hospital';

export const PatientRecords: React.FC = () => {
  const { activeEmergencies, incomingPatients, updatePatientStatus, hospitalId } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [statusInput, setStatusInput] = useState<PatientAdmissionStatus>('ADMITTED');
  const [saving, setSaving] = useState(false);

  // Combine active emergencies and any past cases
  const allRecords = [...activeEmergencies];

  const filteredRecords = allRecords.filter((rec) => {
    const matchesSearch = 
      rec.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.incidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.ambulanceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'CRITICAL' ? rec.severity === 'CRITICAL' :
      statusFilter === 'STABLE' ? rec.severity !== 'CRITICAL' :
      rec.admissionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (rec: any) => {
    setSelectedPatient(rec);
    setNotesInput(rec.emergencyNotes || '');
    setDepartmentInput(rec.department || '');
    setStatusInput(rec.admissionStatus || 'ADMITTED');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSaving(true);
    try {
      await updatePatientStatus(
        selectedPatient.id,
        statusInput,
        departmentInput,
        notesInput
      );
      setSelectedPatient(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Clinical Incident Registry
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Emergency Patient Records ({allRecords.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official emergency intake archive, clinical handovers, and department admissions.
          </p>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="ARRIVED">Arrived</option>
            <option value="HANDED_OVER">Handed Over</option>
            <option value="ADMITTED">Admitted</option>
            <option value="TRANSFERRED">Transferred</option>
            <option value="DISCHARGED">Discharged / Resolved</option>
          </select>
        </div>
      </div>

      {/* QUICK STATUS & SEVERITY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Quick Filter:
        </span>
        {[
          { label: 'All Cases', value: 'ALL' },
          { label: 'Critical', value: 'CRITICAL', isSeverity: true },
          { label: 'Stable', value: 'STABLE', isSeverity: true },
          { label: 'En Route', value: 'EN_ROUTE' },
          { label: 'Arrived', value: 'ARRIVED' },
          { label: 'Admitted', value: 'ADMITTED' },
          { label: 'Discharged', value: 'DISCHARGED' }
        ].map((pill) => {
          const isActive = statusFilter === pill.value;
          return (
            <button
              key={pill.value}
              onClick={() => setStatusFilter(pill.value)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border",
                isActive 
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10" 
                  : "bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      {filteredRecords.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No patient records found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Emergency cases dispatched to this hospital will be permanently archived here.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-700/80">
                <tr>
                  <th className="p-4">Patient / ID</th>
                  <th className="p-4">Incident ID</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Type / Condition</th>
                  <th className="p-4">Ambulance</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Admission Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((rec) => {
                  const isCritical = rec.severity === 'CRITICAL';
                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{rec.patientName}</div>
                        <div className="font-mono text-[11px] text-cyan-400">{rec.patientId}</div>
                      </td>

                      <td className="p-4 font-mono text-xs text-slate-400">
                        {rec.incidentId}
                      </td>

                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                          isCritical ? "bg-red-600 text-white" :
                          rec.severity === 'HIGH' ? "bg-orange-500 text-white" :
                          rec.severity === 'MEDIUM' ? "bg-amber-500 text-black" : "bg-emerald-500 text-black"
                        )}>
                          {rec.severity}
                        </span>
                      </td>

                      <td className="p-4 max-w-xs truncate">
                        <div className="font-semibold text-slate-200">{rec.type}</div>
                        <div className="text-[11px] text-slate-400 truncate">{rec.condition}</div>
                      </td>

                      <td className="p-4 font-mono text-xs">
                        <div className="text-white font-bold">{rec.ambulanceId}</div>
                        <div className="text-slate-500 text-[10px]">{rec.ambulanceNumber}</div>
                      </td>

                      <td className="p-4 text-cyan-400 font-medium">
                        {rec.department}
                      </td>

                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          rec.admissionStatus === 'ADMITTED' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                          rec.admissionStatus === 'HANDED_OVER' ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                          rec.admissionStatus === 'ARRIVED' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                          rec.admissionStatus === 'DISCHARGED' ? "bg-slate-700 text-slate-300" :
                          "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        )}>
                          {rec.admissionStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500 rounded-lg font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Update</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UPDATE RECORD MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold">Update Clinical Record</span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {selectedPatient.patientName} &bull; {selectedPatient.patientId}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Admission / Care Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as PatientAdmissionStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="EN_ROUTE">En Route</option>
                  <option value="ARRIVED">Arrived at Trauma Bay</option>
                  <option value="HANDED_OVER">Patient Handed Over</option>
                  <option value="ADMITTED">Admitted to Ward/ICU</option>
                  <option value="TRANSFERRED">Transferred to Higher Facility</option>
                  <option value="DISCHARGED">Discharged / Resolved</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Assigned Department
                </label>
                <input
                  type="text"
                  value={departmentInput}
                  onChange={(e) => setDepartmentInput(e.target.value)}
                  placeholder="e.g. Trauma Surgery, ICU, Neuro"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Clinical Progress Notes
              </label>
              <textarea
                rows={4}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Enter diagnosis notes, surgeon assigned, interventions performed, blood transfusions..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/20"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Clinical Record'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
