const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const oldSafe = "Safe (342)";
const newSafe = "Safe ({displayVehicles.filter(v => v.status === 'safe').length})";
content = content.replace(oldSafe, newSafe);

const oldWarn = "Warning (41)";
const newWarn = "Warning ({displayVehicles.filter(v => v.status === 'warning').length})";
content = content.replace(oldWarn, newWarn);

const oldSOS = "SOS (3)";
const newSOS = "SOS ({displayVehicles.filter(v => v.status === 'sos').length})";
content = content.replace(oldSOS, newSOS);

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
