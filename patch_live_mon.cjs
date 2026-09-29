const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

// Fix displayVehicles status assignment
content = content.replace("status: 'sos',", "status: a.status === 'resolved' ? 'safe' : 'sos',");

// Fix icon assignment
content = content.replace("icon={sosIcon}", "icon={v.status === 'sos' ? sosIcon : v.status === 'warning' ? warningIcon : safeIcon}");

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
