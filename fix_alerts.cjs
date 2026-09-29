const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

// Fetch all alerts instead of just active
content = content.replace("query(collection(db, 'sos_alerts'), where('status', '==', 'active'))", "query(collection(db, 'sos_alerts'))");

// Now update the rendering of markers so they all use the sosIcon (red blinking)
content = content.replace("icon={v.status === 'sos' ? sosIcon : v.status === 'warning' ? warningIcon : safeIcon}", "icon={sosIcon}");
// Note: wait, v in vehicles map or realAlerts map?
// I need to check how realAlerts is rendered.

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
