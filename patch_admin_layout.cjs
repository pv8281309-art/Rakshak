const fs = require('fs');
const filePath = 'src/layouts/AdminLayout.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'sos_alerts'), where('status', '==', 'new'));
      unsubscribe = onSnapshot(q, (snap) => {
        const fireCount = snap.docs.length;`;

const fixedStr = `    if (isFirebaseConfigured && db) {
      // Manual filter to avoid index requirement
      const q = query(collection(db, 'sos_alerts'));
      unsubscribe = onSnapshot(q, (snap) => {
        const newAlerts = snap.docs.filter(d => d.data().status === 'new');
        const fireCount = newAlerts.length;`;

const targetBell = `            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <BellRing size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rakshak-red rounded-full ring-2 ring-slate-900"></span>
            </button>`;

const fixedBell = `            <div className="relative">
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <BellRing size={20} className={sosCount > 0 ? "animate-pulse text-rakshak-red" : ""} />
                {sosCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-rakshak-red text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900 shadow-lg">
                    {sosCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                    <h3 className="font-bold text-white text-sm">Emergency Alerts</h3>
                    <span className="text-xs bg-rakshak-red/20 text-rakshak-red px-2 py-0.5 rounded font-bold">{sosCount} New</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {sosList.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-sm">No new alerts</div>
                    ) : (
                      sosList.map((sos: any) => (
                        <div key={sos.id} onClick={() => { setNotificationsOpen(false); navigate('/admin/sos-notifications'); }} className="p-3 border-b border-slate-700/50 hover:bg-slate-700/50 cursor-pointer transition-colors flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-rakshak-red/20 flex-shrink-0 flex items-center justify-center text-rakshak-red">
                            <ShieldAlert size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">{sos.type || 'SOS Alert'}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{sos.user} • {sos.vehicle}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <button onClick={() => { setNotificationsOpen(false); navigate('/admin/sos-notifications'); }} className="w-full p-2 text-center text-sm font-medium text-rakshak-cyan hover:bg-slate-700/50 transition-colors">
                    View All in Dashboard
                  </button>
                </div>
              )}
            </div>`;

if(content.includes(targetStr)) {
  content = content.replace(targetStr, fixedStr);
  content = content.replace(targetBell, fixedBell);
  fs.writeFileSync(filePath, content);
  console.log("Patched AdminLayout successfully");
} else {
  console.log("Target string not found in AdminLayout");
}
