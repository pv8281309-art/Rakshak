const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const oldDisplayVehicles = `    .map(a => ({
      id: a.id,
      lat: Number(a.location?.lat || a.lat),
      lng: Number(a.location?.lng || a.lng),
      status: 'sos',
      speed: 0,
      loc: a.address || a.loc || 'Unknown Location',
      userId: a.customerId || a.userId || 'Unknown',
      contact: a.mobile || a.contactNumber || 'N/A',
      timestamp: a.createdAt || a.timestamp || null,
      reporterId: a.userId || a.user || 'Unknown'
    }));`;

const newDisplayVehicles = `    .map(a => ({
      id: a.id,
      lat: Number(a.location?.lat || a.lat),
      lng: Number(a.location?.lng || a.lng),
      status: 'sos' as const,
      speed: 0,
      loc: a.address || a.loc || 'Unknown Location',
      userId: a.customerId || a.userId || 'Unknown',
      customerId: a.customerId || undefined,
      contact: a.mobile || a.contactNumber || 'N/A',
      timestamp: a.createdAt || a.timestamp || null,
      reporterId: a.userId || a.user || 'Unknown'
    }));`;

content = content.replace(oldDisplayVehicles, newDisplayVehicles);

if (!content.includes('import { getDocs }')) {
   content = content.replace("import { collection, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';", "import { collection, onSnapshot, query, where, updateDoc, doc, getDocs } from 'firebase/firestore';");
}

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
