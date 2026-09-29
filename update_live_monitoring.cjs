const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

// 1. Add focusLocation state and network status state
const oldStates = `const LiveMonitoring = () => {
  const [realAlerts, setRealAlerts] = useState<any[]>([]);

  const [newAlertPopup, setNewAlertPopup] = useState<any>(null);`;

const newStates = `const LiveMonitoring = () => {
  const [realAlerts, setRealAlerts] = useState<any[]>([]);
  const [newAlertPopup, setNewAlertPopup] = useState<any>(null);
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);`;
content = content.replace(oldStates, newStates);

// 2. Update MapController to handle focusLocation
const oldMapController = `const MapController = ({ geojson }: { geojson: any }) => {
  const map = useMap();
  useEffect(() => {
    if (geojson) {
      const bounds = L.geoJSON(geojson).getBounds();
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      map.setView([22.5937, 78.9629], 5); // Fallback to center of India
    }
  }, [geojson, map]);
  return null;
};`;

const newMapController = `const MapController = ({ geojson, focusLocation }: { geojson: any, focusLocation: [number, number] | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (focusLocation) {
      map.flyTo(focusLocation, 15, { duration: 1.5 });
    } else if (geojson) {
      const bounds = L.geoJSON(geojson).getBounds();
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      map.setView([22.5937, 78.9629], 5); // Fallback to center of India
    }
  }, [geojson, map, focusLocation]);
  return null;
};`;
content = content.replace(oldMapController, newMapController);

// Update MapContainer children
content = content.replace(
  `<MapController geojson={indiaGeoJSON} />`,
  `<MapController geojson={indiaGeoJSON} focusLocation={focusLocation} />`
);

// 3. Update the realtime listener to trigger focusLocation
const oldListener = `            setTimeout(() => setNewAlertPopup(null), 10000); // hide after 10s
          }`;

const newListener = `            setTimeout(() => setNewAlertPopup(null), 10000); // hide after 10s
            // Auto focus map
            const lat = Number(data.location?.lat || data.lat);
            const lng = Number(data.location?.lng || data.lng);
            if (lat && lng) {
              setFocusLocation([lat, lng]);
            }
          }`;
content = content.replace(oldListener, newListener);

// 4. Update Header and Count
content = content.replace(
  `{/* Top Stats */}`,
  `{/* Connection Status Indicator */}
  <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 shadow-lg backdrop-blur text-xs font-semibold">
    <div className={\`w-2 h-2 rounded-full \${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}\`}></div>
    <span className="text-white">{isConnected ? 'LIVE — Connected' : 'OFFLINE — Reconnecting'}</span>
  </div>
  {/* Top Stats */}`
);

// 5. Update SOS Count and Active Priorities Label
// Finding the SOS tab/button label to update count
content = content.replace(
  `<h3 className="font-bold text-white">Active Priorities</h3>`,
  `<h3 className="font-bold text-white">Active Priorities (SOS: {displayVehicles.filter(v => v.status === 'sos').length})</h3>`
);

// 6. Refactor the Active Priorities cards to match requested UI exactly
const oldCard = `<div 
                  key={alert.id}
                  onClick={() => setSelectedVehicle(alert)}
                  className={\`p-3 border rounded-lg cursor-pointer transition-colors \${
                    alert.status === 'sos' 
                      ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' 
                      : 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20'
                  }\`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className={\`w-1.5 h-1.5 rounded-full \${alert.status === 'sos' ? 'bg-rakshak-red animate-pulse' : 'bg-rakshak-orange'}\`}></div>
                      <span className="text-xs font-bold text-white">{alert.id}</span>
                    </div>
                    <span className={\`text-[10px] font-medium px-1.5 py-0.5 rounded \${
                      alert.status === 'sos' ? 'text-red-400 bg-red-500/10' : 'text-orange-400 bg-orange-500/10'
                    }\`}>
                      {alert.status === 'sos' ? 'CRITICAL' : 'WARNING'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2 truncate">{alert.type || 'Emergency Alert'}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[120px]"><Navigation size={10} /> {alert.loc}</span>
                    <span className="whitespace-nowrap">{alert.timestamp ? new Date(alert.timestamp.seconds ? alert.timestamp.toDate() : alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}</span>
                  </div>
                </div>`;

const newCard = `<div 
                  key={alert.id}
                  className={\`p-4 border rounded-xl flex flex-col gap-3 transition-all \${
                    alert.status === 'sos' 
                      ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                      : 'bg-orange-500/10 border-orange-500/20'
                  }\`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {alert.status === 'sos' && <AlertTriangle size={16} className="text-red-500 animate-pulse" />}
                      <span className="font-bold text-red-500 uppercase tracking-wider">
                        {alert.status === 'sos' ? '🚨 ACTIVE SOS' : 'WARNING'}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{alert.id}</span>
                  </div>

                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-400">User:</span> <span className="font-semibold text-white">{alert.reporterId || alert.userId}</span></p>
                    <p><span className="text-slate-400">Severity:</span> <span className={\`font-bold \${alert.status === 'sos' ? 'text-red-400' : 'text-orange-400'}\`}>{alert.status === 'sos' ? 'CRITICAL' : 'HIGH'}</span></p>
                    <p><span className="text-slate-400">Status:</span> <span className="font-bold text-white uppercase">{alert.status === 'sos' ? 'ACTIVE' : alert.status}</span></p>
                  </div>

                  <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50 text-xs">
                    <p className="text-slate-400 mb-1">Location:</p>
                    <p className="font-mono text-white break-words">{alert.loc !== 'Unknown Location' ? alert.loc : \`\${alert.lat.toFixed(4)}, \${alert.lng.toFixed(4)}\`}</p>
                    {alert.loc === 'Unknown Location' && <p className="text-slate-500 mt-1">Lat: {alert.lat} | Lng: {alert.lng}</p>}
                  </div>

                  <div className="text-xs text-slate-400">
                    <p>Generated: {alert.timestamp ? new Date(alert.timestamp.seconds ? alert.timestamp.toDate() : alert.timestamp).toLocaleString() : 'Just now'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button 
                      onClick={() => {
                        setFocusLocation([alert.lat, alert.lng]);
                        setSelectedVehicle(alert);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded transition-colors"
                    >
                      VIEW ON MAP
                    </button>
                    {alert.status === 'sos' && (
                      <button 
                        onClick={async () => {
                           try {
                             await updateDoc(doc(db, 'sos_alerts', alert.id), { status: 'resolved', resolvedAt: new Date().toISOString() });
                             if (alert.customerId || alert.userId) {
                               const custId = alert.customerId || alert.userId;
                               const snap = await getDocs(query(collection(db, 'customers'), where('customerId', '==', custId)));
                               if (!snap.empty) {
                                  await updateDoc(doc(db, 'customers', snap.docs[0].id), { status: 'active' });
                               }
                             }
                           } catch(e) {
                             console.error("Failed to acknowledge", e);
                           }
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded transition-colors"
                      >
                        ACKNOWLEDGE
                      </button>
                    )}
                  </div>
                </div>`;
content = content.replace(oldCard, newCard);

// 7. Update Map Popup Content
const oldPopup = `<Popup className="custom-popup">
                    <div className="text-slate-900 p-1">
                      <h3 className="font-bold text-sm mb-1">{v.id}</h3>
                      <p className="text-xs mb-1">Status: <span className="uppercase font-semibold" style={{ color: v.status === 'sos' ? '#ef4444' : v.status === 'warning' ? '#f97316' : '#10b981' }}>{v.status}</span></p>
                      {v.timestamp && (
                        <p className="text-[10px] text-slate-500 mb-1">Time: {new Date(v.timestamp.seconds ? v.timestamp.toDate() : v.timestamp).toLocaleTimeString()}</p>
                      )}
                      <p className="text-xs">Location: {v.loc}</p>
                    </div>
                  </Popup>`;

const newPopup = `<Popup className="custom-popup" autoPan={false}>
                    <div className="text-slate-900 p-2 min-w-[200px]">
                      <h3 className="font-bold text-base text-red-600 mb-2 flex items-center gap-1">🚨 ACTIVE SOS</h3>
                      <div className="text-sm space-y-1">
                        <p><span className="font-semibold text-slate-500">SOS ID:</span> <span className="font-mono">{v.id}</span></p>
                        <p><span className="font-semibold text-slate-500">User:</span> {v.reporterId || v.userId}</p>
                        <p><span className="font-semibold text-slate-500">Severity:</span> <span className="font-bold text-red-600">CRITICAL</span></p>
                        <p><span className="font-semibold text-slate-500">Status:</span> <span className="font-bold text-slate-900">ACTIVE</span></p>
                        <hr className="my-1 border-slate-200" />
                        <p><span className="font-semibold text-slate-500">Latitude:</span> {v.lat.toFixed(6)}</p>
                        <p><span className="font-semibold text-slate-500">Longitude:</span> {v.lng.toFixed(6)}</p>
                        <p><span className="font-semibold text-slate-500">Generated:</span> {v.timestamp ? new Date(v.timestamp.seconds ? v.timestamp.toDate() : v.timestamp).toLocaleString() : 'Just now'}</p>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2">
                        <button 
                          onClick={async () => {
                             try {
                               await updateDoc(doc(db, 'sos_alerts', v.id), { status: 'resolved', resolvedAt: new Date().toISOString() });
                               if (v.customerId || v.userId) {
                                 const custId = v.customerId || v.userId;
                                 const snap = await getDocs(query(collection(db, 'customers'), where('customerId', '==', custId)));
                                 if (!snap.empty) {
                                    await updateDoc(doc(db, 'customers', snap.docs[0].id), { status: 'active' });
                                 }
                               }
                             } catch(e) {
                               console.error("Failed to resolve", e);
                             }
                          }}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-1.5 rounded transition-colors"
                        >
                          ACKNOWLEDGE SOS
                        </button>
                      </div>
                    </div>
                  </Popup>`;
content = content.replace(oldPopup, newPopup);

// Import missing getDocs
if (!content.includes('getDocs')) {
  content = content.replace("from 'firebase/firestore';", ", getDocs } from 'firebase/firestore';");
}

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
