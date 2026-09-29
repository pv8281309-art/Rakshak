const fs = require('fs');
let content = fs.readFileSync('src/pages/user/NearbyHospitals.tsx', 'utf8');

const regex = /fetched = fetched\.filter\(\(h: any\) => h\.name !== 'Unknown Hospital' && h\.lat && h\.lon\);\s*const lat = el\.lat[\s\S]*?\}\)\.filter\(\(h: any\) => h\.name !== 'Unknown Hospital' && h\.lat && h\.lon\);/g;

content = content.replace(regex, "fetched = fetched.filter((h: any) => h.name !== 'Unknown Hospital' && h.lat && h.lon);");

fs.writeFileSync('src/pages/user/NearbyHospitals.tsx', content);
