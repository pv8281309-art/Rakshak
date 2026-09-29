const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const displayVehiclesOld = `  const displayVehicles = realAlerts
    .filter(a => a.location?.lat && a.location?.lng && a.status !== 'resolved')
    .map(a => ({
      id: a.id,
      lat: a.location.lat,
      lng: a.location.lng,
      status: 'sos',
      speed: 0,
      loc: a.address || 'Unknown Location',
      userId: a.userId,
      contact: a.mobile || a.contactNumber || 'N/A',
      timestamp: a.createdAt || a.timestamp || null,
      reporterId: a.userId || a.user || 'Unknown'
    }));`;

const displayVehiclesNew = `  const displayVehicles = realAlerts
    .filter(a => ((a.location?.lat && a.location?.lng) || (a.lat && a.lng)) && a.status !== 'resolved')
    .map(a => ({
      id: a.id,
      lat: a.location?.lat || a.lat,
      lng: a.location?.lng || a.lng,
      status: 'sos',
      speed: 0,
      loc: a.address || a.loc || 'Unknown Location',
      userId: a.customerId || a.userId || 'Unknown',
      contact: a.mobile || a.contactNumber || 'N/A',
      timestamp: a.createdAt || a.timestamp || null,
      reporterId: a.userId || a.user || 'Unknown'
    }));`;

content = content.replace(displayVehiclesOld, displayVehiclesNew);
fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
