import React from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';

export interface HotspotSettings {
  threshold: number;
  radius: number;
  timeWindowHours: number; // 0 = all time
  showHeatmap: boolean;
  showLiveSOS: boolean;
}

interface Props {
  settings: HotspotSettings;
  onChange: (newSettings: HotspotSettings) => void;
}

export const HotspotControls: React.FC<Props> = ({ settings, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const update = (key: keyof HotspotSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
          isOpen ? 'bg-rakshak-cyan/20 border-rakshak-cyan/50 text-rakshak-cyan' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
        }`}
      >
        <Settings size={16} /> Hotspot Intelligence
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[1000] p-4 flex flex-col gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Parameters</h4>
            
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300">Min. SOS Threshold</label>
                <input 
                  type="number" 
                  min="2"
                  value={settings.threshold}
                  onChange={e => update('threshold', parseInt(e.target.value) || 10)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-rakshak-cyan"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300">Detection Radius (meters)</label>
                <input 
                  type="number" 
                  min="100"
                  step="100"
                  value={settings.radius}
                  onChange={e => update('radius', parseInt(e.target.value) || 500)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-rakshak-cyan"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300">Time Window</label>
                <select 
                  value={settings.timeWindowHours}
                  onChange={e => update('timeWindowHours', parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-rakshak-cyan"
                >
                  <option value={1}>Last 1 Hour</option>
                  <option value={6}>Last 6 Hours</option>
                  <option value={24}>Last 24 Hours</option>
                  <option value={168}>Last 7 Days</option>
                  <option value={720}>Last 30 Days</option>
                  <option value={0}>All Time</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Visibility</h4>
            
            <div className="space-y-2">
              <button 
                onClick={() => update('showHeatmap', !settings.showHeatmap)}
                className="w-full flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-slate-800 transition-colors"
              >
                <span className={settings.showHeatmap ? 'text-white' : 'text-slate-500'}>Heatmap</span>
                {settings.showHeatmap ? <Eye size={14} className="text-rakshak-cyan" /> : <EyeOff size={14} className="text-slate-600" />}
              </button>
              
              <button 
                onClick={() => update('showLiveSOS', !settings.showLiveSOS)}
                className="w-full flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-slate-800 transition-colors"
              >
                <span className={settings.showLiveSOS ? 'text-white' : 'text-slate-500'}>Live SOS Layer</span>
                {settings.showLiveSOS ? <Eye size={14} className="text-rakshak-cyan" /> : <EyeOff size={14} className="text-slate-600" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
