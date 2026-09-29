const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const oldTime = "selectedVehicle.timestamp ? new Date(selectedVehicle.timestamp.seconds ? selectedVehicle.timestamp.toDate() : selectedVehicle.timestamp).toLocaleString() : 'Just now'";
const newTime = "selectedVehicle.timestamp ? (typeof selectedVehicle.timestamp.toDate === 'function' ? selectedVehicle.timestamp.toDate().toLocaleString() : new Date(selectedVehicle.timestamp).toLocaleString()) : 'Just now'";
content = content.replace(oldTime, newTime);

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
