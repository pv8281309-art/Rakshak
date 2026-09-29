const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const handleClearAllOld = `  const handleClearAll = async () => {
    const activeAlerts = realAlerts.filter(a => a.status !== 'resolved');
    for (const alert of activeAlerts) {
      try {
        await updateDoc(doc(db, 'sos_alerts', alert.id), {
          status: 'resolved',
          resolvedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Error clearing alert:", err);
      }
    }
  };`;

const handleClearAllNew = `  const handleClearAll = async () => {
    const activeAlerts = realAlerts.filter(a => a.status !== 'resolved');
    for (const alert of activeAlerts) {
      try {
        await updateDoc(doc(db, 'sos_alerts', alert.id), {
          status: 'resolved',
          resolvedAt: new Date().toISOString()
        });
        
        // Also try to reset customer status if customerId is present
        if (alert.customerId || alert.userId) {
           const custId = alert.customerId || alert.userId;
           const q = query(collection(db, 'customers'), where('customerId', '==', custId));
           import('firebase/firestore').then(async ({ getDocs }) => {
              const snap = await getDocs(q);
              if (!snap.empty) {
                 await updateDoc(doc(db, 'customers', snap.docs[0].id), { status: 'active' });
              }
           });
        }
      } catch (err) {
        console.error("Error clearing alert:", err);
      }
    }
  };`;

content = content.replace(handleClearAllOld, handleClearAllNew);
fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
