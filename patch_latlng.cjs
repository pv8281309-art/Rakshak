const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const oldMap = `    .map(a => ({
      id: a.id,
      lat: a.location?.lat || a.lat,
      lng: a.location?.lng || a.lng,
      status: 'sos',`;

const newMap = `    .map(a => ({
      id: a.id,
      lat: Number(a.location?.lat || a.lat),
      lng: Number(a.location?.lng || a.lng),
      status: 'sos',`;

content = content.replace(oldMap, newMap);
fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
