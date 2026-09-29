import React from 'react';
import { HospitalRecommendationItem } from '../../types/emergency';
import { X, Phone, MapPin, CheckCircle2, AlertCircle, Clock, Bed, Activity, ShieldCheck, Ambulance, HeartPulse } from 'lucide-react';

interface HospitalDetailsModalProps {
  hospital: HospitalRecommendationItem | null;
  onClose: () => void;
  onAssign?: (hospital: HospitalRecommendationItem) => void;
  isAssigned?: boolean;
}

export const HospitalDetailsModal: React.FC<HospitalDetailsModalProps> = ({
  hospital,
  onClose,
  onAssign,
  isAssigned
}) => {
  if (!hospital) return null;

  const res = hospital.resourcesSnapshot;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                hospital.rank === 1 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                Rank #{hospital.rank} • {hospital.badge}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                {hospital.hospitalId}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Score: <strong className="text-emerald-400">{hospital.operationalScore}%</strong>
              </span>
            </div>
            <h3 className="text-xl font-black text-white">{hospital.hospitalName}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>{hospital.address}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Distance & ETA</span>
              <span className="text-base font-black text-white font-mono">{hospital.distanceKm} km</span>
              <span className="text-xs text-cyan-400 font-bold block mt-0.5">{hospital.etaText}</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">ICU Beds</span>
              <span className="text-base font-black text-indigo-400 font-mono">
                {res.icuBedsAvailable} <span className="text-xs text-slate-400 font-normal">/ {res.icuBedsTotal}</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Ventilators: {res.ventilators}</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Emergency Beds</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {res.emergencyBedsAvailable} <span className="text-xs text-slate-400 font-normal">/ {res.emergencyBedsTotal}</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">General: {res.generalBedsAvailable} free</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Ambulances</span>
              <span className="text-base font-black text-sky-400 font-mono">{res.availableAmbulances} Units</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Ready on standby</span>
            </div>
          </div>

          {/* Freshness & Emergency Contact Bar */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block">Bed Resource Freshness</span>
                <span className={`text-xs font-bold ${hospital.dataFreshness.isStale ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {hospital.dataFreshness.freshnessLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-slate-200 font-bold">{hospital.emergencyContact || hospital.contactNumber}</span>
              </div>
            </div>
          </div>

          {/* Why Recommended / Suitability Factors */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Suitability Assessment Factors</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {hospital.suitabilityFactors.map((factor, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                    factor.isMet 
                      ? 'bg-slate-800/40 border-slate-700/60 text-slate-200' 
                      : 'bg-red-950/20 border-red-800/40 text-red-200'
                  }`}
                >
                  {factor.isMet ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <span className="font-bold block">{factor.label}</span>
                    <span className="text-slate-400 block text-[11px]">{factor.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities Badges */}
          <div>
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider mb-2.5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Emergency Capabilities & Departments</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                res.traumaCapable 
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-700/50' 
                  : 'bg-slate-800/40 text-slate-400 border-slate-700'
              }`}>
                {res.traumaCapable ? '✓ Certified Trauma Center' : 'General Emergency Care'}
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-950/50 text-cyan-300 border border-cyan-700/50">
                ✓ 24/7 Emergency Operation
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-950/50 text-indigo-300 border border-indigo-700/50">
                ✓ ICU & Life Support
              </span>
              {res.bloodBankAvailable && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-950/50 text-rose-300 border border-rose-700/50">
                  ✓ Blood Bank Available
                </span>
              )}
              {hospital.specializations?.map((spec, i) => (
                <span key={i} className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
          
          {onAssign && (
            <button
              onClick={() => {
                onAssign(hospital);
                onClose();
              }}
              disabled={isAssigned}
              className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all ${
                isAssigned
                  ? 'bg-emerald-800 text-emerald-100 cursor-default opacity-80'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>{isAssigned ? 'Currently Assigned' : 'Assign to this Hospital'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
