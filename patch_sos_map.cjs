const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

if (!content.includes('import { db }')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { collection, onSnapshot, query, where } from 'firebase/firestore';\nimport { db } from '../../lib/firebase';");
}

const mockVehiclesReplace = `const [realAlerts, setRealAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'sos_alerts'), where('status', '==', 'active'));
    const unsub = onSnapshot(q, (snap) => {
      const active = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealAlerts(active);
    });
    return () => unsub();
  }, []);

  const displayVehicles = [
    ...vehicles.filter(v => v.id !== 'SOS-992'), // Keep mocks but remove mock SOS
    ...realAlerts.filter(a => a.location?.lat && a.location?.lng).map(a => ({
      id: a.id,
      lat: a.location.lat,
      lng: a.location.lng,
      status: 'sos',
      speed: 0,
      loc: a.address || 'Unknown Location',
      userId: a.userId
    }))
  ];
`;

content = content.replace("const [activeLayer, setActiveLayer] = useState<keyof typeof mapLayers>('dark');", mockVehiclesReplace + "\n  const [activeLayer, setActiveLayer] = useState<keyof typeof mapLayers>('dark');");

content = content.replace(/vehicles\.map/g, "displayVehicles.map");
content = content.replace(/vehicles\.filter/g, "displayVehicles.filter");

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
