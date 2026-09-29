import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, X, Save, RefreshCw } from 'lucide-react';
import { HospitalRecord, HospitalType } from '../../../types';

interface EditHospitalModalProps {
  isOpen: boolean;
  hospital: HospitalRecord | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditHospitalModal: React.FC<EditHospitalModalProps> = ({
  isOpen,
  hospital,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Editable fields
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalType, setHospitalType] = useState<HospitalType>('Multi-Specialty');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(25);

  // Beds & Capacity
  const [totalBeds, setTotalBeds] = useState(0);
  const [availableBeds, setAvailableBeds] = useState(0);
  const [icuBeds, setIcuBeds] = useState(0);
  const [availableIcuBeds, setAvailableIcuBeds] = useState(0);
  const [emergencyBeds, setEmergencyBeds] = useState(0);
  const [ventilators, setVentilators] = useState(0);

  // Ambulances
  const [totalAmbulances, setTotalAmbulances] = useState(0);
  const [availableAmbulances, setAvailableAmbulances] = useState(0);

  useEffect(() => {
    if (hospital) {
      setHospitalName(hospital.hospitalName || '');
      setHospitalType((hospital.hospitalType as HospitalType) || 'Multi-Specialty');
      setRegistrationNumber(hospital.registrationNumber || '');
      setAddress(hospital.address || '');
      setContactNumber(hospital.contactNumber || '');
      setEmergencyContact(hospital.emergencyContact || '');
      setEmail(hospital.email || '');
      setWebsite(hospital.website || '');
      setServiceRadiusKm(hospital.serviceRadiusKm || 25);

      setTotalBeds(hospital.capacity?.totalBeds || 0);
      setAvailableBeds(hospital.capacity?.availableBeds || 0);
      setIcuBeds(hospital.capacity?.icuBeds || 0);
      setAvailableIcuBeds(hospital.capacity?.availableIcuBeds || 0);
      setEmergencyBeds(hospital.capacity?.emergencyBeds || 0);
      setVentilators(hospital.capacity?.ventilators || 0);

      setTotalAmbulances(hospital.ambulances?.total || 0);
      setAvailableAmbulances(hospital.ambulances?.available || 0);
    }
  }, [hospital]);

  if (!isOpen || !hospital) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        hospitalName,
        hospitalType,
        registrationNumber,
        address,
        contactNumber,
        emergencyContact,
        email,
        website,
        serviceRadiusKm: Number(serviceRadiusKm) || 25,
        capacity: {
          ...hospital.capacity,
          totalBeds: Number(totalBeds) || 0,
          availableBeds: Number(availableBeds) || 0,
          icuBeds: Number(icuBeds) || 0,
          availableIcuBeds: Number(availableIcuBeds) || 0,
          emergencyBeds: Number(emergencyBeds) || 0,
          ventilators: Number(ventilators) || 0,
        },
        ambulances: {
          ...hospital.ambulances,
          total: Number(totalAmbulances) || 0,
          available: Number(availableAmbulances) || 0,
        },
        adminId: 'ADMIN',
      };

      const res = await fetch(`/api/admin/hospitals/${hospital.hospitalId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update hospital details');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Edit Hospital Information</h3>
              <p className="text-xs text-slate-400 font-mono">{hospital.hospitalId} — {hospital.hospitalName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Hospital Name</label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={e => setHospitalName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Hospital Type</label>
              <select
                value={hospitalType}
                onChange={e => setHospitalType(e.target.value as HospitalType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Trauma Center">Trauma Center</option>
                <option value="Multi-Specialty">Multi-Specialty</option>
                <option value="Specialty Hospital">Specialty Hospital</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">License / Registration Number</label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={e => setRegistrationNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Primary Contact Number</label>
              <input
                type="text"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Emergency 24/7 Helpline</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                className="w-full bg-slate-800 border border-rose-500/40 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Website</label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <h4 className="font-semibold text-cyan-400 uppercase tracking-wider mb-2">Capacity & Fleet Metrics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Total Beds</label>
                <input
                  type="number"
                  min={0}
                  value={totalBeds}
                  onChange={e => setTotalBeds(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Available Beds</label>
                <input
                  type="number"
                  min={0}
                  value={availableBeds}
                  onChange={e => setAvailableBeds(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-300 text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">ICU Beds</label>
                <input
                  type="number"
                  min={0}
                  value={icuBeds}
                  onChange={e => setIcuBeds(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Available ICU Beds</label>
                <input
                  type="number"
                  min={0}
                  value={availableIcuBeds}
                  onChange={e => setAvailableIcuBeds(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-cyan-500/40 rounded-xl px-3 py-2 text-cyan-300 text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Emergency Beds</label>
                <input
                  type="number"
                  min={0}
                  value={emergencyBeds}
                  onChange={e => setEmergencyBeds(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Ventilators</label>
                <input
                  type="number"
                  min={0}
                  value={ventilators}
                  onChange={e => setVentilators(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Total Ambulances</label>
                <input
                  type="number"
                  min={0}
                  value={totalAmbulances}
                  onChange={e => setTotalAmbulances(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Available Ambulances</label>
                <input
                  type="number"
                  min={0}
                  value={availableAmbulances}
                  onChange={e => setAvailableAmbulances(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-300 text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-2 -mx-6 -mb-6 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
