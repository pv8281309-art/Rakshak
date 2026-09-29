const fs = require('fs');
const filePath = 'src/pages/admin/AlertsSOS.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetLogic = `  const handleStatusUpdate = async (sosId: string, newStatus: string) => {
    // Update Firebase
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'sos_alerts', sosId), { status: newStatus });
      } catch(e) {
        console.warn("Could not update firestore:", e);
      }
    }
    // Update Local
    setAlerts(prev => {
      const updated = prev.map(a => a.id === sosId ? { ...a, status: newStatus } : a);
      localStorage.setItem('rakshak_sos_alerts', JSON.stringify(updated));
      return updated;
    });
  };`;

const replacementLogic = `  const handleStatusUpdate = async (sosId: string, newStatus: string) => {
    // Update Firebase
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'sos_alerts', sosId), { status: newStatus });
        // Also update customer document if we have customerId to keep them in sync
        const targetAlert = alerts.find(a => a.id === sosId);
        if (targetAlert && targetAlert.customerId) {
           // Find the customer doc by customerId
           const q = query(collection(db, 'customers'), where('customerId', '==', targetAlert.customerId));
           const snap = await getDocs(q);
           if (!snap.empty) {
             const custId = snap.docs[0].id;
             // If resolved, back to active. Otherwise use the newStatus (responding)
             const custStatus = newStatus === 'resolved' ? 'active' : newStatus;
             await updateDoc(doc(db, 'customers', custId), { status: custStatus });
           }
        }
      } catch(e) {
        console.warn("Could not update firestore:", e);
      }
    }
    // Update Local
    setAlerts(prev => {
      const updated = prev.map(a => a.id === sosId ? { ...a, status: newStatus } : a);
      localStorage.setItem('rakshak_sos_alerts', JSON.stringify(updated));
      return updated;
    });
  };`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync(filePath, content);
console.log("Patched AlertsSOS logic");
