const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

content = content.replace("...displayVehicles.filter", "...vehicles.filter");

// Also:
// const filteredVehicles = filterMode === 'alerts' 
//   ? displayVehicles.filter(v => v.status === 'sos' || v.status === 'warning')
//   : vehicles;
// Wait! It should fallback to displayVehicles not vehicles!
content = content.replace("    : vehicles;", "    : displayVehicles;");

// Also check realAlerts status:
// If it is 'resolved', we want it to map to 'resolved'. Wait, in the map: status: 'sos'.
// I'll change it to status: a.status === 'resolved' ? 'resolved' : 'sos'
content = content.replace("status: 'sos',", "status: a.status === 'resolved' ? 'sos' : 'sos',"); // wait, "marked with red color and blink repeatedly... shouldn't show green"
// So even if resolved, it should be 'sos' to keep blinking red! This is what the user asked.

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
