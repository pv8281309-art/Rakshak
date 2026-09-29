const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

// 1. Add imports
content = content.replace("import { Navigation, Filter, Layers, AlertTriangle } from 'lucide-react';", 
  "import { Navigation, Filter, Layers, AlertTriangle, X, Clock, PhoneCall, User } from 'lucide-react';\nimport { AnimatePresence, motion } from 'framer-motion';");

// 2. Modify displayVehicles mapping
const oldMapping = `    ...realAlerts.filter(a => a.location?.lat && a.location?.lng).map(a => ({
      id: a.id,
      lat: a.location.lat,
      lng: a.location.lng,
      status: a.status === 'resolved' ? 'safe' : 'sos',
      speed: 0,
      loc: a.address || 'Unknown Location',
      userId: a.userId
    }))`;
const newMapping = `    ...realAlerts.filter(a => a.location?.lat && a.location?.lng).map(a => ({
      id: a.id,
      lat: a.location.lat,
      lng: a.location.lng,
      status: a.status === 'resolved' ? 'safe' : 'sos',
      speed: 0,
      loc: a.address || 'Unknown Location',
      userId: a.userId,
      contact: a.mobile || a.contactNumber || 'N/A',
      timestamp: a.createdAt || a.timestamp || null,
      reporterId: a.userId || a.user || 'Unknown'
    }))`;
content = content.replace(oldMapping, newMapping);

// 3. Add state
content = content.replace("const [showLayerMenu, setShowLayerMenu] = useState(false);", 
  "const [showLayerMenu, setShowLayerMenu] = useState(false);\n  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);");

// 4. Update Marker click
const oldMarker = `<EmergencyMarker key={v.id} position={[v.lat, v.lng]} status={v.status}>`;
const newMarker = `<EmergencyMarker key={v.id} position={[v.lat, v.lng]} status={v.status} onClick={() => setSelectedVehicle(v)}>`;
content = content.replace(oldMarker, newMarker);

// 5. Add Detail Drawer
const drawerCode = `
      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 md:w-96 bg-slate-900 border-l border-slate-700 shadow-2xl z-[2000] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Emergency Details
              </h2>
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Incident Status</h3>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">ID</span>
                    <span className="text-sm font-mono text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{selectedVehicle.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Status</span>
                    <span className="text-sm font-bold uppercase" style={{ color: selectedVehicle.status === 'sos' ? '#ef4444' : selectedVehicle.status === 'warning' ? '#f97316' : '#10b981' }}>{selectedVehicle.status}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Metadata</h3>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-slate-400"><User size={16} /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-0.5">Reporter ID / User</p>
                      <p className="text-sm text-white font-medium">{selectedVehicle.reporterId || selectedVehicle.userId || 'System Generated'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-slate-400"><PhoneCall size={16} /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-0.5">Contact Number</p>
                      <p className="text-sm text-rakshak-cyan font-mono">{selectedVehicle.contact || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-slate-400"><Clock size={16} /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-0.5">Timestamp</p>
                      <p className="text-sm text-white">{selectedVehicle.timestamp ? new Date(selectedVehicle.timestamp.seconds ? selectedVehicle.timestamp.toDate() : selectedVehicle.timestamp).toLocaleString() : 'Just now'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-slate-400"><Navigation size={16} /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-0.5">Location</p>
                      <p className="text-sm text-white">{selectedVehicle.loc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
`;

content = content.replace("    </div>\n  );\n};", drawerCode);

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
