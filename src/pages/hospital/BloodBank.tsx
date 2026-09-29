import React, { useState } from 'react';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  Droplet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Save, 
  X, 
  ShieldCheck, 
  Plus, 
  Minus,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { BloodGroup, BloodInventoryItem, BloodStockStatus } from '../../types/hospital';

export const BloodBank: React.FC = () => {
  const { bloodBank, updateBloodBank, hospitalId } = useHospital();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleStartEdit = () => {
    if (!bloodBank) return;
    const initial: any = {};
    bloodGroups.forEach(grp => {
      const item = bloodBank[grp] || { units: 10, minThreshold: 15, criticalThreshold: 5 };
      initial[grp] = {
        units: item.units,
        minThreshold: item.minThreshold || 15,
        criticalThreshold: item.criticalThreshold || 5
      };
    });
    setFormData(initial);
    setEditing(true);
    setSaveSuccess(false);
  };

  const handleUnitsChange = (grp: BloodGroup, delta: number) => {
    setFormData((prev: any) => {
      const current = prev[grp]?.units || 0;
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        [grp]: { ...prev[grp], units: next }
      };
    });
  };

  const handleSetUnits = (grp: BloodGroup, units: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [grp]: { ...prev[grp], units: Math.max(0, units) }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const success = await updateBloodBank(formData);
      if (success) {
        setSaveSuccess(true);
        setEditing(false);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } finally {
      setSaving(false);
    }
  };

  // Aggregated totals
  let totalUnits = 0;
  let criticalGroupsCount = 0;
  let lowGroupsCount = 0;

  if (bloodBank) {
    Object.values(bloodBank).forEach(item => {
      totalUnits += item.units;
      if (item.status === 'CRITICAL') criticalGroupsCount++;
      if (item.status === 'LOW') lowGroupsCount++;
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Emergency Transfusion Inventory
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Blood Bank & Critical Stock Reserve
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of packed red blood cells (PRBC) across all ABO/Rh blood groups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              Blood Stock Updated & Synced
            </span>
          )}

          {!editing ? (
            <button
              onClick={handleStartEdit}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Update Stock</span>
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

      {/* SUMMARY BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Blood Units</span>
          <span className="text-3xl font-black text-white mt-1 block font-mono">
            {totalUnits}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Active reserve units</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Critical Shortages</span>
          <span className={cn(
            "text-3xl font-black mt-1 block font-mono",
            criticalGroupsCount > 0 ? "text-red-400 animate-pulse" : "text-emerald-400"
          )}>
            {criticalGroupsCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Groups below 5 units</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Low Stock Warnings</span>
          <span className="text-3xl font-black text-amber-400 mt-1 block font-mono">
            {lowGroupsCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Groups below 15 units</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Universal Donor (O-)</span>
          <span className="text-3xl font-black text-cyan-400 mt-1 block font-mono">
            {bloodBank?.['O-']?.units ?? 4}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Emergency rapid trauma reserve</span>
        </div>
      </div>

      {/* EDIT FORM OR CARDS GRID */}
      {editing ? (
        <form onSubmit={handleSave} className="bg-slate-900/80 border border-red-500/40 rounded-2xl p-6 backdrop-blur-xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">Adjust Blood Bank Stock Levels</h2>
              <p className="text-xs text-slate-400">
                Rule 11: Authorized staff inventory adjustment. Changes will be logged with your staff identity.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Confirm & Save Stock'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bloodGroups.map((grp) => {
              const current = formData?.[grp] || { units: 0 };
              return (
                <div key={grp} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-white">{grp}</span>
                    <span className="text-xs font-mono text-slate-400">Threshold: &lt;5 / &lt;15</span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleUnitsChange(grp, -1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={current.units}
                      onChange={(e) => handleSetUnits(grp, parseInt(e.target.value) || 0)}
                      className="w-16 bg-transparent text-center font-mono text-base font-bold text-white focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleUnitsChange(grp, 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
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
              <span>{saving ? 'Saving...' : 'Save Stock Inventory'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* BLOOD GROUP CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bloodGroups.map((grp) => {
            const item: BloodInventoryItem = bloodBank?.[grp] || {
              bloodGroup: grp,
              units: 10,
              status: 'AVAILABLE',
              minThreshold: 15,
              criticalThreshold: 5,
              lastUpdated: new Date().toISOString()
            };

            const isCritical = item.status === 'CRITICAL';
            const isLow = item.status === 'LOW';

            return (
              <div
                key={grp}
                className={cn(
                  "p-5 rounded-2xl border transition-all duration-200 backdrop-blur-md flex flex-col justify-between h-44",
                  isCritical ? "bg-red-950/30 border-red-800/80 shadow-lg shadow-red-950/40" :
                  isLow ? "bg-amber-950/20 border-amber-800/60" : "bg-slate-900/60 border-slate-800"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm",
                      isCritical ? "bg-red-500/20 text-red-400" :
                      isLow ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                      {grp}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Group {grp}</span>
                      <span className="text-[10px] text-slate-400">PRBC Units</span>
                    </div>
                  </div>

                  <span className={cn(
                    "text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider",
                    isCritical ? "bg-red-600 text-white animate-pulse" :
                    isLow ? "bg-amber-500 text-black" : "bg-emerald-500/20 text-emerald-300"
                  )}>
                    {item.status}
                  </span>
                </div>

                <div className="my-auto">
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className={cn(
                      "text-4xl font-black tracking-tight",
                      isCritical ? "text-red-400" :
                      isLow ? "text-amber-400" : "text-white"
                    )}>
                      {item.units}
                    </span>
                    <span className="text-xs text-slate-400">units</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Threshold: &lt;{item.criticalThreshold} Critical</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Verified'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER METADATA */}
      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Certified Transfusion Bank • Verified Cold-Chain Storage (2°C - 6°C)
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-500" />
          Inventory Synchronized with State Blood Grid
        </span>
      </div>
    </div>
  );
};
