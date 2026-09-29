import React, { useState } from 'react';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  BedDouble, 
  Ambulance, 
  Stethoscope 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const HospitalProfile: React.FC = () => {
  const { hospitalId, hospital, beds, refreshHospitalData } = useHospital();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile editable fields
  const [emergencyPhone, setEmergencyPhone] = useState(hospital?.emergencyContact || hospital?.contactNumber || '+91 11 26588500');
  const [adminPhone, setAdminPhone] = useState(hospital?.contactNumber || '+91 11 26588700');
  const [contactEmail, setContactEmail] = useState(hospital?.email || 'emergency@hospital.gov.in');

  const specialties = [
    'Emergency & Trauma Surgery',
    'Cardiology & Cath Lab',
    'Neurology & Stroke Center',
    'Orthopedic Trauma',
    'Pediatric Critical Care',
    'Burn & Plastic Reconstruction',
    'Intensive Care (Level 3)',
    'Blood Transfusion Center'
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save contact updates via backend
      const res = await fetch(`/api/hospital/${hospitalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergencyPhone,
          contactNumber: adminPhone,
          contactEmail
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setEditing(false);
        refreshHospitalData();
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Facility Credential Profile
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {hospital?.hospitalName || 'Emergency Hospital Facility'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered trauma intake node in the Operation Rakshak 3.2 State Emergency Grid.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              Profile Saved
            </span>
          )}

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <span>Edit Contact Info</span>
            </button>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* FACILITY STATUS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm">
            ID
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Unique Facility ID</span>
            <span className="text-base font-black text-cyan-400 font-mono block">{hospitalId}</span>
            <span className="text-[11px] text-slate-500">Permanent Auth Token</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Registration Status</span>
            <span className="text-base font-bold text-emerald-400 block">VERIFIED & ACTIVE</span>
            <span className="text-[11px] text-slate-500">Operation Rakshak Node</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Facility Tier</span>
            <span className="text-base font-bold text-white block">Apex Trauma Center</span>
            <span className="text-[11px] text-slate-500">Level 1 Multi-Specialty</span>
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: LOCATION & CONTACT */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Location & Contact Channels
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Physical Address</span>
              <p className="text-white font-medium mt-0.5">{hospital?.address || 'Ansari Nagar East'}</p>
              <p className="text-slate-400">{hospital?.city || 'New Delhi'}, {hospital?.state || 'Delhi'} - {hospital?.pinCode || '110029'}</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">GPS Coordinates</span>
              <p className="font-mono text-cyan-400 mt-0.5">
                Latitude: {hospital?.latitude ?? 28.5672} &bull; Longitude: {hospital?.longitude ?? 77.2100}
              </p>
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                    Emergency Hotline Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                    Administrative Contact Phone
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Contacts'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergency Hotline</span>
                  <p className="text-emerald-400 font-bold font-mono mt-0.5">{emergencyPhone}</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Admin Telephone</span>
                  <p className="text-white font-mono mt-0.5">{adminPhone}</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Email</span>
                  <p className="text-cyan-400 font-mono mt-0.5">{contactEmail}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: DEPARTMENTS & SPECIALTIES */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-cyan-400" />
            Accredited Clinical Capabilities
          </h2>

          <p className="text-xs text-slate-400">
            Designated high-acuity departments active for Operation Rakshak automated trauma routing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {specialties.map((spec, i) => (
              <div
                key={i}
                className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-200">{spec}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Ambulance Bays: <strong className="text-white">4 Dedicated</strong></span>
            <span>Helipad: <strong className="text-emerald-400">Available</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
