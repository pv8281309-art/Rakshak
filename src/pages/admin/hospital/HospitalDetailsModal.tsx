import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, X, Ambulance, Bed, Stethoscope, MapPin, 
  ShieldAlert, Phone, Mail, Globe, Clock, Shield, Key, Edit2, Lock
} from 'lucide-react';
import { HospitalRecord } from '../../../types';

interface HospitalDetailsModalProps {
  isOpen: boolean;
  hospital: HospitalRecord | null;
  onClose: () => void;
  onEdit: (hospital: HospitalRecord) => void;
  onResetPassword: (hospital: HospitalRecord) => void;
}

export const HospitalDetailsModal: React.FC<HospitalDetailsModalProps> = ({
  isOpen,
  hospital,
  onClose,
  onEdit,
  onResetPassword,
}) => {
  if (!isOpen || !hospital) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'PENDING_ACTIVATION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'SUSPENDED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'REVOKED':
        return 'bg-red-700/30 text-red-400 border-red-600/50';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{hospital.hospitalName}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(hospital.account?.status || 'ACTIVE')}`}>
                  {hospital.account?.status?.replace('_', ' ') || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-mono text-cyan-400 font-bold">{hospital.hospitalId}</span>
                <span>•</span>
                <span>{hospital.hospitalType}</span>
                <span>•</span>
                <span>Reg: {hospital.registrationNumber}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(hospital);
              }}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => {
                onClose();
                onResetPassword(hospital);
              }}
              className="py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/30 transition"
            >
              <Key className="w-3.5 h-3.5" /> Reset Pass
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-200">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Bed className="w-3.5 h-3.5 text-cyan-400" /> Total Beds
              </span>
              <p className="text-xl font-bold text-white">{hospital.capacity?.totalBeds || 0}</p>
              <p className="text-xs text-emerald-400 font-medium">{hospital.capacity?.availableBeds || 0} Available</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-rose-400" /> ICU Beds
              </span>
              <p className="text-xl font-bold text-white">{hospital.capacity?.icuBeds || 0}</p>
              <p className="text-xs text-cyan-400 font-medium">{hospital.capacity?.availableIcuBeds || 0} Available</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Ambulance className="w-3.5 h-3.5 text-amber-400" /> Ambulances
              </span>
              <p className="text-xl font-bold text-white">{hospital.ambulances?.total || 0}</p>
              <p className="text-xs text-emerald-400 font-medium">{hospital.ambulances?.available || 0} Available</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-400" /> Ventilators
              </span>
              <p className="text-xl font-bold text-white">{hospital.capacity?.ventilators || 0}</p>
              <p className="text-xs text-slate-400 font-medium">{hospital.capacity?.emergencyBeds || 0} Emergency Beds</p>
            </div>
          </div>

          {/* Contact & Location Section */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Address & Contact Coordinates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Physical Address:</span>
                <p className="text-white font-medium mt-0.5">{hospital.address || 'Not specified'}, {hospital.city}, {hospital.state} - {hospital.pinCode}</p>
              </div>
              <div>
                <span className="text-slate-400">GPS Coordinates:</span>
                <p className="text-cyan-300 font-mono mt-0.5">{hospital.latitude?.toFixed(5)}, {hospital.longitude?.toFixed(5)}</p>
              </div>
              <div>
                <span className="text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Main Contact:
                </span>
                <p className="text-white font-medium mt-0.5">{hospital.contactNumber}</p>
              </div>
              <div>
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3" /> 24/7 Emergency Line:
                </span>
                <p className="text-rose-300 font-bold mt-0.5">{hospital.emergencyContact}</p>
              </div>
              {hospital.email && (
                <div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Official Email:
                  </span>
                  <p className="text-white mt-0.5">{hospital.email}</p>
                </div>
              )}
              {hospital.website && (
                <div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Website:
                  </span>
                  <p className="text-cyan-400 mt-0.5">{hospital.website}</p>
                </div>
              )}
            </div>
          </div>

          {/* Medical Staff (Doctors) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> Registered Medical Staff ({hospital.doctors?.length || 0})
            </h4>
            {hospital.doctors && hospital.doctors.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-700/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5">Doctor Name</th>
                      <th className="px-3 py-2.5">Specialization</th>
                      <th className="px-3 py-2.5">Department</th>
                      <th className="px-3 py-2.5">Experience</th>
                      <th className="px-3 py-2.5">Shift</th>
                      <th className="px-3 py-2.5 text-center">Emergency Ready</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {hospital.doctors.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2.5 font-semibold text-white">{doc.name}</td>
                        <td className="px-3 py-2.5 text-slate-300">{doc.specialization}</td>
                        <td className="px-3 py-2.5 text-slate-400">{doc.department}</td>
                        <td className="px-3 py-2.5 text-slate-400">{doc.experience || '—'}</td>
                        <td className="px-3 py-2.5 text-slate-400">{doc.shiftTiming || '—'}</td>
                        <td className="px-3 py-2.5 text-center">
                          {doc.emergencyAvailability ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-800">
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No doctors configured yet.</p>
            )}
          </div>

          {/* Emergency Capabilities & Coverage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Emergency Capabilities</h4>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {[
                  { key: 'emergency24x7', label: '24/7 Emergency Department' },
                  { key: 'traumaCenter', label: 'Designated Trauma Center' },
                  { key: 'icuAvailable', label: 'ICU / Critical Care Active' },
                  { key: 'ambulanceAvailable', label: 'Ambulance Standby' },
                  { key: 'emergencySurgery', label: 'Emergency Trauma Surgery OT' },
                  { key: 'bloodBank', label: 'Licensed Blood Bank' },
                  { key: 'ventilatorAvailable', label: 'Ventilator Life Support' },
                  { key: 'physiotherapyRehab', label: 'Physiotherapy & Rehab' },
                  { key: 'accidentTreatment', label: 'Road Accident Resuscitation' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-0.5">
                    <span className="text-slate-300">{item.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      (hospital.emergencyCapabilities as any)?.[item.key]
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-slate-500'
                    }`}>
                      {(hospital.emergencyCapabilities as any)?.[item.key] ? 'Enabled' : 'No'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Coverage & Dispatch Bound</h4>
              <p className="text-xs text-slate-300">
                Service Radius: <span className="text-cyan-400 font-bold">{hospital.serviceRadiusKm || 25} km</span>
              </p>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">Covered Sectors / Localities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {hospital.coverageAreas && hospital.coverageAreas.length > 0 ? (
                    hospital.coverageAreas.map(area => (
                      <span key={area} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-200">
                        {area}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-xs italic">City-wide</span>
                  )}
                </div>
              </div>
              {hospital.emergencyCapabilities?.notes && (
                <div className="mt-3 pt-3 border-t border-slate-700/60">
                  <span className="text-[11px] text-slate-400 block mb-1">Emergency Protocols / Notes:</span>
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {hospital.emergencyCapabilities.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Specializations & Services Badges */}
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Clinical Specializations:</span>
              <div className="flex flex-wrap gap-1.5">
                {hospital.specializations?.map(spec => (
                  <span key={spec} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Services & Facilities:</span>
              <div className="flex flex-wrap gap-1.5">
                {hospital.services?.map(srv => (
                  <span key={srv} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium">
                    {srv}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Account & Audit Footer Info */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap justify-between items-center text-[11px] text-slate-400 gap-2">
            <div>
              <span>Registered: </span>
              <span className="text-white font-medium">{hospital.account?.createdAt ? new Date(hospital.account.createdAt).toLocaleString() : '—'}</span>
            </div>
            <div>
              <span>Last Login: </span>
              <span className="text-white font-medium">{hospital.account?.lastLogin ? new Date(hospital.account.lastLogin).toLocaleString() : 'Never'}</span>
            </div>
            <div>
              <span>Password Status: </span>
              <span className={`font-semibold ${hospital.account?.mustChangePassword ? 'text-amber-400' : 'text-emerald-400'}`}>
                {hospital.account?.mustChangePassword ? 'Temporary (Must Change)' : 'Permanent Set'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Close Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};
