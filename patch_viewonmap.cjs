const fs = require('fs');
let liveMonitor = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const oldButton = `                    <button 
                      onClick={() => {
                        setFocusLocation([alert.lat, alert.lng]);
                        setSelectedVehicle(alert);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded transition-colors"
                    >
                      VIEW ON MAP
                    </button>`;

const newButton = `                    <button 
                      onClick={() => {
                        if (alert.lat && alert.lng) {
                          setFocusLocation([alert.lat, alert.lng]);
                          setSelectedVehicle(alert);
                        } else {
                          alert("No GPS coordinates available for this SOS alert.");
                        }
                      }}
                      className={\`text-white text-xs font-bold py-2 rounded transition-colors \${(alert.lat && alert.lng) ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-800/50 cursor-not-allowed opacity-50'}\`}
                      disabled={!alert.lat || !alert.lng}
                    >
                      VIEW ON MAP
                    </button>`;

liveMonitor = liveMonitor.replace(oldButton, newButton);
fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', liveMonitor);
