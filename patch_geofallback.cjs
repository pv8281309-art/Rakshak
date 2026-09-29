const fs = require('fs');
let userDash = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

const oldGeo = `    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => fireSos(pos.coords.latitude, pos.coords.longitude),
         (err) => fireSos(28.6139, 77.2090), // Fallback if denied
         { timeout: 3000, maximumAge: 10000 } // Added timeout to prevent hanging
       );
    } else {
       fireSos(28.6139, 77.2090);
    }`;

const newGeo = `    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         (pos) => fireSos(pos.coords.latitude, pos.coords.longitude),
         (err) => fireSos(0, 0), // 0,0 means no location available
         { timeout: 5000, maximumAge: 10000 }
       );
    } else {
       fireSos(0, 0);
    }`;

userDash = userDash.replace(oldGeo, newGeo);

// Update fireSos to handle 0,0
const oldFireSos = `          const newSOS = {
            id: sosId,
            customerId: userData.customerId,
            user: userData.name,
            vehicle: userData.vehicle?.regNo || 'Unknown',
            mobile: userData.emergencyContacts?.[0]?.mobile || 'Unknown',
            type: 'Manual Panic (User Dash)',
            severity: 'critical',
            loc: 'Live GPS Location',
            lat: lat,
            lng: lng,
            status: 'new',
            timestamp: Date.now(),
            createdAt: serverTimestamp()
          };`;

const newFireSos = `          const newSOS = {
            id: sosId,
            customerId: userData.customerId,
            user: userData.name,
            vehicle: userData.vehicle?.regNo || 'Unknown',
            mobile: userData.emergencyContacts?.[0]?.mobile || 'Unknown',
            type: 'Manual Panic (User Dash)',
            severity: 'critical',
            loc: lat !== 0 && lng !== 0 ? 'Live GPS Location' : 'Location Unavailable',
            lat: lat !== 0 ? lat : null,
            lng: lng !== 0 ? lng : null,
            status: 'new',
            timestamp: Date.now(),
            createdAt: serverTimestamp()
          };`;
userDash = userDash.replace(oldFireSos, newFireSos);
fs.writeFileSync('src/pages/user/UserDashboard.tsx', userDash);


let liveMonitor = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const oldDisplayVehicles = `  const displayVehicles = realAlerts
    .filter(a => ((a.location?.lat && a.location?.lng) || (a.lat && a.lng)) && a.status !== 'resolved')
    .map(a => ({
      id: a.id,
      lat: Number(a.location?.lat || a.lat),
      lng: Number(a.location?.lng || a.lng),
      status: 'sos' as const,`;

const newDisplayVehicles = `  const displayVehicles = realAlerts
    .filter(a => a.status !== 'resolved')
    .map(a => ({
      id: a.id,
      lat: a.location?.lat || a.lat || null,
      lng: a.location?.lng || a.lng || null,
      status: 'sos' as const,`;

liveMonitor = liveMonitor.replace(oldDisplayVehicles, newDisplayVehicles);

// Fix the location fallback display in LiveMonitoring
const oldLocDisplay = `alert.loc !== 'Unknown Location' ? alert.loc : \\\`\\\${alert.lat.toFixed(4)}, \\\${alert.lng.toFixed(4)}\\\``;
const newLocDisplay = `(alert.lat && alert.lng) ? (alert.loc !== 'Unknown Location' ? alert.loc : \\\`\\\${alert.lat.toFixed(4)}, \\\${alert.lng.toFixed(4)}\\\`) : 'Location Unavailable (GPS Denied)'`;

liveMonitor = liveMonitor.replace(oldLocDisplay, newLocDisplay);

// Only render marker if lat/lng are valid
const oldMarker = `{hotspotSettings.showLiveSOS && filteredVehicles.map((v) => (`;
const newMarker = `{hotspotSettings.showLiveSOS && filteredVehicles.filter(v => v.lat && v.lng).map((v) => (`;
liveMonitor = liveMonitor.replace(oldMarker, newMarker);

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', liveMonitor);
