const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const hookOld = `  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'sos_alerts'));
    const unsub = onSnapshot(q, (snap) => {
      const active = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealAlerts(active);
    });
    return () => unsub();
  }, []);`;

const hookNew = `  const [newAlertPopup, setNewAlertPopup] = useState<any>(null);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'sos_alerts'));
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          // Show alert if it's new and triggered within the last 5 minutes
          if (data.status === 'new' && (Date.now() - data.timestamp < 300000)) {
            setNewAlertPopup(data);
            setTimeout(() => setNewAlertPopup(null), 10000); // hide after 10s
          }
        }
      });
      const active = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealAlerts(active);
    });
    return () => unsub();
  }, []);`;

content = content.replace(hookOld, hookNew);

const renderOld = `      {/* Top Stats */}`;
const renderNew = `      {/* Top Stats */}
      <AnimatePresence>
        {newAlertPopup && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] bg-rakshak-red/90 backdrop-blur border border-red-500 text-white px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center gap-4"
          >
            <div className="bg-white/20 p-2 rounded-full animate-pulse">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="font-bold text-xl uppercase tracking-wider">Emergency SOS Triggered!</h3>
              <p className="font-semibold">{newAlertPopup.user || newAlertPopup.customerId} needs immediate response.</p>
              <p className="text-sm opacity-80">Location: {newAlertPopup.loc || "Live Coordinates"}</p>
            </div>
            <button onClick={() => setNewAlertPopup(null)} className="ml-4 p-2 hover:bg-white/20 rounded">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
`;

content = content.replace(renderOld, renderNew);
fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
