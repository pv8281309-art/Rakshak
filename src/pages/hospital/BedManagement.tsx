import React, { useState } from 'react';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  BedDouble, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Save, 
  X,
  ShieldCheck,
  Building2,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { BedCategory, HospitalBedsData } from '../../types/hospital';

export const BedManagement: React.FC = () => {
  const { beds, updateBeds, hospitalId, lastTelemetryUpdate } = useHospital();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const categories: { key: BedCategory; label: string; desc: string }[] = [
    { key: 'general', label: 'General Ward', desc: 'Standard inpatient care and recovery' },
    { key: 'emergency', label: 'Emergency & Trauma', desc: 'Active resuscitation and acute trauma bays' },
    { key: 'icu', label: 'Intensive Care Unit (ICU)', desc: 'Level 3 invasive life-support and ventilation' },
    { key: 'hdu', label: 'High Dependency Unit (HDU)', desc: 'Step-down intensive monitoring' },
    { key: 'pediatric', label: 'Pediatric Care', desc: 'Children and neonatal emergency intake' },
    { key: 'isolation', label: 'Isolation Ward', desc: 'Negative pressure and infectious containment' },
    { key: 'other', label: 'Specialty / Day Care', desc: 'Short stay, oncology, dialysis, observation' },
  ];

  const handleStartEdit = () => {
    if (!beds) return;
    const initial: any = {};
    categories.forEach(c => {
      const data = (beds as any)[c.key] || { total: 20, occupied: 10, available: 10 };
      initial[c.key] = {
        total: data.total,
        occupied: data.occupied
      };
    });
    setFormData(initial);
    setEditing(true);
    setSaveSuccess(false);
  };

  const handleFieldChange = (key: BedCategory, field: 'total' | 'occupied', val: number) => {
    setFormData((prev: any) => {
      const updatedCat = { ...prev[key], [field]: Math.max(0, val) };
      // Keep occupied <= total
      if (field === 'occupied' && updatedCat.occupied > updatedCat.total) {
        updatedCat.total = updatedCat.occupied;
      }
      return { ...prev, [key]: updatedCat };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const success = await updateBeds(formData);
      if (success) {
        setSaveSuccess(true);
        setEditing(false);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Facility Resource Control
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Bed Capacity & Occupancy Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official hospital bed matrix across trauma, intensive care, HDU, and specialty wards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              Bed Matrix Updated & Synced
            </span>
          )}

          {!editing ? (
            <button
              onClick={handleStartEdit}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Update Availability</span>
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

      {/* OVERALL CAPACITY BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Facility Beds</span>
          <span className="text-3xl font-black text-white mt-1 block">
            {beds?.totalBeds ?? 80}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">All active inpatient wards</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Available Beds</span>
          <span className="text-3xl font-black text-emerald-400 mt-1 block">
            {beds?.totalAvailable ?? 24}
          </span>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">Ready for immediate intake</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Occupied Beds</span>
          <span className="text-3xl font-black text-white mt-1 block">
            {beds?.totalOccupied ?? 56}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Currently admitted</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Occupancy Rate</span>
          <span className="text-3xl font-black text-cyan-400 mt-1 block">
            {beds?.overallOccupancyRate ?? 70}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Facility utilization level</span>
        </div>
      </div>

      {/* EDIT FORM OR VIEW GRID */}
      {editing ? (
        <form onSubmit={handleSave} className="bg-slate-900/80 border border-cyan-500/40 rounded-2xl p-6 backdrop-blur-xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Edit Inpatient Bed Capacity</h2>
              <p className="text-xs text-slate-400">
                Authorized staff update. Rule 9: Bed counts will only update upon staff submission.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Confirm & Save Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const current = formData?.[cat.key] || { total: 0, occupied: 0 };
              const available = Math.max(0, current.total - current.occupied);
              const rate = current.total > 0 ? Math.round((current.occupied / current.total) * 100) : 0;

              return (
                <div key={cat.key} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{cat.label}</h3>
                      <p className="text-[11px] text-slate-400">{cat.desc}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {rate}% Occ
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total</label>
                      <input
                        type="number"
                        min="0"
                        value={current.total}
                        onChange={(e) => handleFieldChange(cat.key, 'total', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white text-center focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Occupied</label>
                      <input
                        type="number"
                        min="0"
                        max={current.total}
                        value={current.occupied}
                        onChange={(e) => handleFieldChange(cat.key, 'occupied', parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white text-center focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Available</label>
                      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400 font-bold text-center">
                        {available}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Bed Matrix'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* CATEGORY CARDS BREAKDOWN */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const data = (beds as any)?.[cat.key] || {
              total: 20,
              occupied: 14,
              available: 6,
              occupancyRate: 70
            };

            const isLow = data.available <= 2;

            return (
              <div
                key={cat.key}
                className={cn(
                  "p-5 rounded-2xl border transition-all duration-200 backdrop-blur-md",
                  isLow ? "bg-slate-900/80 border-amber-800/60" : "bg-slate-900/60 border-slate-800"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{cat.label}</span>
                  <span className={cn(
                    "text-[11px] font-mono font-bold px-2 py-0.5 rounded",
                    data.occupancyRate >= 85 ? "bg-red-500/20 text-red-400" :
                    data.occupancyRate >= 70 ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                  )}>
                    {data.occupancyRate}% Occ
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-4">{cat.desc}</p>

                {/* Numbers */}
                <div className="grid grid-cols-3 gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total</span>
                    <span className="text-sm font-bold text-white">{data.total}</span>
                  </div>
                  <div className="border-x border-slate-700">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Occupied</span>
                    <span className="text-sm font-bold text-slate-300">{data.occupied}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Available</span>
                    <span className={cn(
                      "text-sm font-black",
                      isLow ? "text-amber-400" : "text-emerald-400"
                    )}>
                      {data.available}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        data.occupancyRate >= 85 ? "bg-red-500" :
                        data.occupancyRate >= 70 ? "bg-amber-400" : "bg-emerald-400"
                      )}
                      style={{ width: `${Math.min(100, data.occupancyRate)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER AUDIT METADATA */}
      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Last Updated By: <strong className="text-slate-200">{beds?.updatedBy || 'Staff User'}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-500" />
          Timestamp: {beds?.lastUpdated ? new Date(beds.lastUpdated).toLocaleString('en-IN') : 'Synchronized'}
        </span>
      </div>
    </div>
  );
};
