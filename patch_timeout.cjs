const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

const oldGeo = `    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => fireSos(pos.coords.latitude, pos.coords.longitude),
         (err) => fireSos(28.6139, 77.2090) // Fallback if denied
       );
    } else {
       fireSos(28.6139, 77.2090);
    }`;

const newGeo = `    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => fireSos(pos.coords.latitude, pos.coords.longitude),
         (err) => fireSos(28.6139, 77.2090), // Fallback if denied
         { timeout: 3000, maximumAge: 10000 } // Added timeout to prevent hanging
       );
    } else {
       fireSos(28.6139, 77.2090);
    }`;

content = content.replace(oldGeo, newGeo);
fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
