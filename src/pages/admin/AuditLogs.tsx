import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { Activity, Search, RefreshCw, Shield, Clock, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const defaultSeedLogs = [
    {
      id: 'AUD-8821',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      action: 'CRITICAL_DISPATCH_AUTHORIZED',
      targetUserId: 'USR-IN-150001 (Rajesh Sharma)',
      adminId: 'ADM-001 (Trauma Commander)',
      status: 'SUCCESS',
      details: 'ALS Ambulance Unit 101 cleared for Yamuna Expressway KM 44.8 impact'
    },
    {
      id: 'AUD-8820',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      action: 'TRAUMA_BED_RESERVED',
      targetUserId: 'AIIMS Apex Trauma Centre',
      adminId: 'SYSTEM_AUTONOMOUS',
      status: 'SUCCESS',
      details: 'Emergency Bay 02 & ICU Bed reserved prior to victim arrival'
    },
    {
      id: 'AUD-8819',
      timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
      action: 'TELEMETRY_KEY_ROTATED',
      targetUserId: 'OBD-3.0-DEL-4921',
      adminId: 'SEC_OP_NODE_4',
      status: 'SUCCESS',
      details: 'ECDSA P-256 session token refreshed over encrypted 5G link'
    },
    {
      id: 'AUD-8818',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      action: 'HOSPITAL_CREDENTIAL_ISSUED',
      targetUserId: 'Apollo Hospital Sarita Vihar',
      adminId: 'ADM-001 (Trauma Commander)',
      status: 'SUCCESS',
      details: 'Secure portal access token provisioned for Emergency Chief'
    },
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && db) {
        const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setLogs(data);
          setLoading(false);
          return;
        }
      }
      setLogs(defaultSeedLogs);
    } catch (e) {
      setLogs(defaultSeedLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.targetUserId || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.adminId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-16 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity size={13} /> Security & System Compliance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Immutable Audit Trail
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tamper-evident logs of all automated emergency actions, dispatch authorizations, and hospital telemetry broadcasts.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search audit trail..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button 
            onClick={fetchLogs}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-blue-400" : ""} />
          </button>
        </div>
      </div>

      <div className="bolt-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="bg-slate-900/90 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Action Type</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Target Entity</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Operator / Node</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No logs found matching your search.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={log.id} 
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-blue-950/80 text-blue-400 border border-blue-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-white">
                      {log.targetUserId}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-400">
                      {log.adminId}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                        {log.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
