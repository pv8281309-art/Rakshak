import React, { useState, useEffect } from 'react';
import { Radio, Wifi, Activity, MapPin, Signal } from 'lucide-react';
import { RakshakRTDBService, RTDBDeviceData } from '../services/RakshakRTDBService';

interface RakshakDeviceStatusProps {
  className?: string;
}

export const RakshakDeviceStatus: React.FC<RakshakDeviceStatusProps> = ({
  className = ''
}) => {
  const [deviceData, setDeviceData] = useState<RTDBDeviceData | null>(null);

  useEffect(() => {
    const unsubscribe = RakshakRTDBService.subscribeToDevice((data) => {
      setDeviceData(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isOnline = deviceData?.online === true;
  const wifiConn = deviceData?.wifiConnected === true;
  const simConn = deviceData?.simConnected === true;
  const signal = deviceData?.signalStrength ?? 'N/A';
  const lat = deviceData?.location?.latitude;
  const lng = deviceData?.location?.longitude;

  return (
    <div className={`w-full bg-[#0D1527] border border-slate-800 rounded-2xl p-4 shadow-xl text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-md border ${
          isOnline ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10' : 'bg-red-500/20 text-red-400 border-red-500/40 shadow-red-500/10'
        }`}>
          <Radio size={20} className={isOnline ? 'animate-pulse' : ''} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-black text-white text-sm tracking-tight">RAKSHAK_001 Device</h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
              isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Wi-Fi: {wifiConn ? 'Connected' : 'Disconnected'} • SIM: {simConn ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs font-mono w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
          <Signal size={14} className={signal !== 'N/A' ? 'text-emerald-400' : 'text-slate-600'} />
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Signal</span>
            <span className="font-bold text-white">{signal}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
          <Wifi size={14} className={wifiConn ? 'text-emerald-400' : 'text-slate-600'} />
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Wi-Fi</span>
            <span className={`font-bold ${wifiConn ? 'text-emerald-400' : 'text-slate-400'}`}>
              {wifiConn ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800">
          <MapPin size={14} className="text-amber-400" />
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold">GPS Location</span>
            <span className="font-bold text-white">
              {lat !== undefined && lng !== undefined ? `${lat.toFixed(3)}, ${lng.toFixed(3)}` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
