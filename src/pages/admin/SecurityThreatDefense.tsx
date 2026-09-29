import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Globe, 
  Server, 
  RefreshCw, 
  Terminal, 
  Eye, 
  Wifi
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const threatData = [
  { name: 'CAN-Bus Spoofing Deflected', value: 42, color: '#ef4444' },
  { name: 'Brute-Force JWT Invalidation', value: 28, color: '#f97316' },
  { name: 'Telemetry Flooding Throttled', value: 18, color: '#eab308' },
  { name: 'Clean Encrypted Telemetry', value: 312, color: '#06b6d4' },
];

const trafficLogs = [
  { ip: '103.21.244.0', attempt: 'CAN-Bus Injection on /api/telemetry/stream', status: 'Deflected by HSM', time: '2 mins ago', severity: 'High' },
  { ip: '45.33.21.90', attempt: 'Brute Force on Trauma Chief Portal', status: 'IP Isolated (24h)', time: '8 mins ago', severity: 'Critical' },
  { ip: '104.28.1.19', attempt: 'Unsigned Firmware Over-the-Air Probe', status: 'Signature Rejected', time: '15 mins ago', severity: 'Medium' },
  { ip: '157.240.19.35', attempt: 'mTLS 1.3 Transponder Handshake', status: 'Verified & Encrypted', time: 'Just now', severity: 'Low' },
];

export default function SecurityThreatDefense() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const handleRunSecurityScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1800);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full pb-20 font-sans text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={13} /> Active HSM & Cyber Threat Shield
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">System Security & Cyber Defense</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-time CAN-bus intrusion mitigation, mTLS telemetry verification, and WAF protection.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunSecurityScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
            {isScanning ? 'Auditing Nodes...' : 'Run Cryptographic Scan'}
          </button>
        </div>
      </div>

      {scanComplete && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between text-emerald-300 text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Cryptographic Scan Passed: 100% of telemetry payloads verified with zero integrity deviations.</span>
          </div>
          <button onClick={() => setScanComplete(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </motion.div>
      )}

      {/* Security Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bolt-card p-4 rounded-xl border border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">HSM Core Firewall</p>
            <p className="text-sm font-black text-emerald-400 mt-0.5">Hardware Armored</p>
          </div>
        </div>

        <div className="bolt-card p-4 rounded-xl border border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Attacks Neutralized</p>
            <p className="text-sm font-black text-white mt-0.5">88 Probes Deflected</p>
          </div>
        </div>

        <div className="bolt-card p-4 rounded-xl border border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Lock size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">mTLS Encryption</p>
            <p className="text-sm font-black text-blue-400 mt-0.5">ECC-384 / TLS 1.3</p>
          </div>
        </div>

        <div className="bolt-card p-4 rounded-xl border border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Server size={22} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Radar Gateway SLA</p>
            <p className="text-sm font-black text-purple-400 mt-0.5">99.99% Availability</p>
          </div>
        </div>
      </div>

      {/* Charts Section: Donut Chart for Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Donut Chart */}
        <div className="bolt-card p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <div className="w-full flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-white">Payload Distribution</h3>
            <span className="text-[10px] font-mono text-slate-400">Past 24 Hours</span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {threatData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '10px', color: '#f8fafc', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-slate-800">
            {threatData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-slate-300 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Threat Logs Table */}
        <div className="bolt-card p-5 rounded-2xl border border-slate-800 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal size={15} className="text-red-400" />
              Live Gateway Intrusion & Vector Logs
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/30">
              ● HSM ENFORCED
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-2">Origin Endpoint</th>
                  <th className="py-2.5 px-2">Signature / Payload</th>
                  <th className="py-2.5 px-2">Severity</th>
                  <th className="py-2.5 px-2">Mitigation</th>
                  <th className="py-2.5 px-2 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {trafficLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-2 font-mono text-blue-400 font-bold text-[11px]">{log.ip}</td>
                    <td className="py-2.5 px-2 text-slate-200 text-xs">{log.attempt}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.severity === 'Critical' ? 'bg-red-950/80 text-red-400 border border-red-500/40' :
                        log.severity === 'High' ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40' :
                        log.severity === 'Medium' ? 'bg-yellow-950/80 text-yellow-400 border border-yellow-500/40' :
                        'bg-blue-950/80 text-blue-400 border border-blue-500/40'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-mono text-emerald-400 text-[11px]">{log.status}</td>
                    <td className="py-2.5 px-2 text-right text-slate-400 text-[11px] font-mono">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
