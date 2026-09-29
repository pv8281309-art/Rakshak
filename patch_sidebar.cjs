const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const regex = /<div className="flex-1 overflow-y-auto p-2 space-y-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Detail Drawer \*\/\}/;

const newSidebar = `<div className="flex-1 overflow-y-auto p-2 space-y-2">
            {displayVehicles.filter(v => v.status === 'sos' || v.status === 'warning').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                <p className="text-sm">No active alerts.</p>
              </div>
            ) : (
              displayVehicles.filter(v => v.status === 'sos' || v.status === 'warning').map(alert => (
                <div 
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Detail Drawer */}`;

content = content.replace(regex, newSidebar);
fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
