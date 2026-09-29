const fs = require('fs');
let c = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf8');

// Add state for notifications drop down and list of active alerts
const stateTarget = `const [sosCount, setSosCount] = useState(0);`;
const stateReplacement = `const [sosCount, setSosCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sosList, setSosList] = useState<any[]>([]);`;
c = c.replace(stateTarget, stateReplacement);

// Update effect to store list
const effectTarget = `          // Merge
          snap.docs.forEach(d => {
            if (!activeLocal.find((l:any) => l.id === d.id)) activeLocal.push({ id: d.id, status: 'new' });
          });
          setSosCount(activeLocal.length);
        } catch(e) {
          setSosCount(fireCount);
        }`;
const effectReplacement = `          // Merge
          snap.docs.forEach(d => {
            if (!activeLocal.find((l:any) => l.id === d.id)) activeLocal.push({ id: d.id, ...d.data(), status: 'new' });
          });
          setSosCount(activeLocal.length);
          setSosList(activeLocal);
        } catch(e) {
          setSosCount(fireCount);
          setSosList(snap.docs.map(d => ({id: d.id, ...d.data()})));
        }`;
c = c.replace(effectTarget, effectReplacement);

// Update checkLocal to also set list
const checkLocalTarget = `        const active = local.filter((a: any) => a.status === 'new').length;
        setSosCount(active);
      } catch (e) {}`;
const checkLocalReplacement = `        const active = local.filter((a: any) => a.status === 'new');
        setSosCount(active.length);
        setSosList(active);
      } catch (e) {}`;
c = c.replace(checkLocalTarget, checkLocalReplacement);

// Replace Bell Button
const bellTarget = `<button className="p-2 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 rounded-full transition-colors relative">
              <BellRing size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rakshak-red rounded-full ring-2 ring-slate-900"></span>
            </button>`;
const bellReplacement = `<div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 rounded-full transition-colors relative"
              >
                <BellRing size={20} />
                {sosCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rakshak-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rakshak-red text-[8px] font-bold text-white border border-slate-900">{sosCount}</span>
                  </span>
                )}
              </button>

              {/* SOS Notifications Dropdown */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-xl border border-red-500/30 bg-[#0A1122]/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(239,68,68,0.15)] z-50 overflow-hidden transform origin-top-right transition-all">
                    
                    {/* Header */}
                    <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <AlertTriangle size={18} className="text-rakshak-red animate-pulse" />
                        SOS Notifications
                      </div>
                      <span className="text-xs bg-rakshak-red text-white px-2 py-0.5 rounded-full font-bold">{sosCount} New</span>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[60vh] overflow-y-auto">
                      {sosList.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          <ShieldCheck size={32} className="mx-auto mb-2 text-slate-600" />
                          No active emergencies.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-800">
                          {sosList.map((sos, i) => (
                            <div key={i} className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group" onClick={() => { setNotificationsOpen(false); navigate('/admin/sos-notifications'); }}>
                              <div className="flex gap-3">
                                <div className="mt-0.5">
                                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <AlertTriangle size={14} className="text-rakshak-red" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-bold text-white group-hover:text-rakshak-red transition-colors">{sos.user || 'Unknown User'} - {sos.type || 'Emergency'}</h4>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">Just now</span>
                                  </div>
                                  <p className="text-xs text-slate-300 mt-1">{sos.loc || 'Location unavailable'}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">{sos.id || 'SOS'}</span>
                                    <span className="text-[10px] font-bold text-rakshak-red border border-rakshak-red/30 bg-rakshak-red/10 px-1.5 py-0.5 rounded">NEW</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="p-3 border-t border-slate-800 bg-slate-900/50">
                      <button 
                        onClick={() => { setNotificationsOpen(false); navigate('/admin/sos-notifications'); }}
                        className="w-full py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-center"
                      >
                        VIEW COMMAND CENTER
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>`;
c = c.replace(bellTarget, bellReplacement);

fs.writeFileSync('src/layouts/AdminLayout.tsx', c);
