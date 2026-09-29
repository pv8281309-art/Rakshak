import React from 'react';
import { useRakshakDevice } from '../hooks/useRakshakDevice';
import { Activity, Radio, Wifi, Signal, Compass, Gauge, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { RakshakGForceChart } from './RakshakGForceChart';

export const RakshakSensorDisplay: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { deviceData, loading } = useRakshakDevice();

  if (loading) {
    return (
      <div className={`p-4 bg-[#0D1527] border border-slate-800 rounded-2xl text-slate-400 text-xs font-mono animate-pulse ${className}`}>
        Connecting to /devices/RAKSHAK_001/sensor stream...
      </div>
    );
  }

  const sensor = deviceData?.sensor || {};
  const status = deviceData?.status || {};
  const isOnline = deviceData?.online === true;
  const wifiConn = deviceData?.wifiConnected === true;
  const simConn = deviceData?.simConnected === true;
  const signal = deviceData?.signalStrength ?? 'N/A';

  const ax = sensor.ax ?? 0.0;
  const ay = sensor.ay ?? 0.0;
  const az = sensor.az ?? 1.0;
  const totalG = sensor.totalG ?? 1.0;
  const dynamicG = sensor.dynamicG ?? 0.0;
  const tilt = sensor.tilt ?? 0.0;

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {/* Connectivity Status Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0D1527] border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <Radio size={16} className={isOnline ? 'animate-pulse' : ''} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono block uppercase">Device Status</span>
            <motion.span layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={`text-xs font-black uppercase font-mono block ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </motion.span>
          </div>
        </div>

        <div className="bg-[#0D1527] border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${wifiConn ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
            <Wifi size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono block uppercase">Wi-Fi Status</span>
            <motion.span layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={`text-xs font-black uppercase font-mono block ${wifiConn ? 'text-blue-400' : 'text-slate-400'}`}>
              {wifiConn ? 'Connected' : 'Disconnected'}
            </motion.span>
          </div>
        </div>

        <div className="bg-[#0D1527] border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${simConn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
            <Signal size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono block uppercase">SIM & GSM</span>
            <motion.span layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={`text-xs font-black uppercase font-mono block ${simConn ? 'text-emerald-400' : 'text-slate-400'}`}>
              {simConn ? `Connected (${signal})` : 'Disconnected'}
            </motion.span>
          </div>
        </div>

        <div className="bg-[#0D1527] border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${status.accident ? 'bg-red-600 text-white animate-bounce' : 'bg-slate-800 text-slate-400'}`}>
            <ShieldAlert size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono block uppercase">Crash Sensor</span>
            <motion.span layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={`text-xs font-black uppercase font-mono block ${status.accident ? 'text-red-400' : 'text-emerald-400'}`}>
              {status.accident ? 'Accident Detected!' : 'Nominal / Armed'}
            </motion.span>
          </div>
        </div>
      </div>

      {/* MPU6050 Accelerometer & Tilt Telemetry Grid */}
      <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-500 animate-pulse" />
            <h4 className="font-bold text-white text-sm">MPU6050 Real-Time Sensor Stream (/devices/RAKSHAK_001/sensor)</h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            Live onValue() Stream
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 block">AX (X-Axis)</span>
            <motion.span layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="text-base font-black font-mono text-white mt-1 block">
              {typeof ax === 'number' ? ax.toFixed(2) : ax} G
            </motion.span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 block">AY (Y-Axis)</span>
            <motion.span layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="text-base font-black font-mono text-white mt-1 block">
              {typeof ay === 'number' ? ay.toFixed(2) : ay} G
            </motion.span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 block">AZ (Z-Axis)</span>
            <motion.span layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="text-base font-black font-mono text-white mt-1 block">
              {typeof az === 'number' ? az.toFixed(2) : az} G
            </motion.span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 block">Total G-Force</span>
            <motion.span layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="text-base font-black font-mono text-blue-400 mt-1 block">
              {typeof totalG === 'number' ? totalG.toFixed(2) : totalG} G
            </motion.span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 block">Dynamic G</span>
            <motion.span layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="text-base font-black font-mono text-amber-400 mt-1 block">
              {typeof dynamicG === 'number' ? dynamicG.toFixed(2) : dynamicG} G
            </motion.span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 block">Tilt Angle</span>
            <motion.span layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="text-base font-black font-mono text-emerald-400 mt-1 block">
              {typeof tilt === 'number' ? tilt.toFixed(1) : tilt}°
            </motion.span>
          </div>
        </div>
      </div>

      {/* Live Recharts Line Chart visualizing totalG stream */}
      <RakshakGForceChart />
    </div>
  );
};
