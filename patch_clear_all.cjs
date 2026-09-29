const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

content = content.replace(
  "await updateDoc(doc(db, 'alerts', alert.id), {",
  "await updateDoc(doc(db, 'sos_alerts', alert.id), {"
);

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
