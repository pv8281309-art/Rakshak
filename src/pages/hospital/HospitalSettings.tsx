import React, { useState } from 'react';
import { useHospital } from '../../contexts/HospitalContext';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Bell, 
  ShieldCheck, 
  KeyRound, 
  Save, 
  CheckCircle2, 
  Play, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const HospitalSettings: React.FC = () => {
  const { soundEnabled, setSoundEnabled, hospitalId } = useHospital();
  const [bedThreshold, setBedThreshold] = useState<number>(85);
  const [bloodCriticalThreshold, setBloodCriticalThreshold] = useState<number>(5);
  const [notifyIncoming, setNotifyIncoming] = useState(true);
  const [notifyCommand, setNotifyCommand] = useState(true);
  const [notifyCapacity, setNotifyCapacity] = useState(true);
  const [saved, setSaved] = useState(false);

  const testAudioChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`rakshak_settings_${hospitalId}`, JSON.stringify({
      bedThreshold,
      bloodCriticalThreshold,
      notifyIncoming,
      notifyCommand,
      notifyCapacity
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Facility Preferences
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Hospital System Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure audio alerts, automated capacity triggers, and operational notification rules.
          </p>
        </div>

        {saved && (
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            Preferences Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AUDIO ALERTS SECTION */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            Audio Siren & Chimes
          </h2>
          <p className="text-xs text-slate-400">
            Sound alerts play through the dashboard speaker whenever an incoming Critical (Tier 1) trauma patient is assigned.
          </p>

          <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-white block">Emergency Audio Siren</span>
              <span className="text-xs text-slate-400">High-priority synthesizer tone on trauma dispatches</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={testAudioChime}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>Test Chime</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg font-bold text-xs transition-colors",
                  soundEnabled 
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20" 
                    : "bg-slate-700 text-slate-400"
                )}
              >
                {soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>
          </div>
        </div>

        {/* THRESHOLD TRIGGER RULES */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Resource Threshold Triggers
          </h2>
          <p className="text-xs text-slate-400">
            Triggers warning banners and notifies State Command Center when hospital reserves drop below critical limits.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Bed Capacity Warning Threshold (%)
              </label>
              <p className="text-[11px] text-slate-400">
                Trigger warning when total facility occupancy exceeds this level.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="60"
                  max="98"
                  value={bedThreshold}
                  onChange={(e) => setBedThreshold(parseInt(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <span className="font-mono text-sm font-bold text-cyan-400 w-12 text-right">
                  {bedThreshold}%
                </span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Blood Group Critical Threshold (Units)
              </label>
              <p className="text-[11px] text-slate-400">
                Trigger red alert if any blood group falls below this number of PRBC units.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={bloodCriticalThreshold}
                  onChange={(e) => setBloodCriticalThreshold(parseInt(e.target.value))}
                  className="w-full accent-red-400"
                />
                <span className="font-mono text-sm font-bold text-red-400 w-12 text-right">
                  {bloodCriticalThreshold} u
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATION PREFERENCES */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Dispatch Notification Feeds
          </h2>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 cursor-pointer">
              <span className="text-xs font-semibold text-white">Incoming Emergency Dispatches</span>
              <input
                type="checkbox"
                checked={notifyIncoming}
                onChange={(e) => setNotifyIncoming(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 cursor-pointer">
              <span className="text-xs font-semibold text-white">State Command Center Tactical Broadcasts</span>
              <input
                type="checkbox"
                checked={notifyCommand}
                onChange={(e) => setNotifyCommand(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 cursor-pointer">
              <span className="text-xs font-semibold text-white">Blood Bank & Bed Capacity Deficit Alarms</span>
              <input
                type="checkbox"
                checked={notifyCapacity}
                onChange={(e) => setNotifyCapacity(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
