const fs = require('fs');
let liveMonitor = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const oldButton = `                      onClick={() => {
                        if (alert.lat && alert.lng) {
                          setFocusLocation([alert.lat, alert.lng]);
                          setSelectedVehicle(alert);
                        } else {
                          alert("No GPS coordinates available for this SOS alert.");
                        }
                      }}`;

const newButton = `                      onClick={() => {
                        if (alert.lat && alert.lng) {
                          setFocusLocation([alert.lat, alert.lng]);
                          setSelectedVehicle(alert);
                        } else {
                          window.alert("No GPS coordinates available for this SOS alert.");
                        }
                      }}`;

liveMonitor = liveMonitor.replace(oldButton, newButton);
fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', liveMonitor);
