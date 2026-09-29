const fs = require('fs');
const filePath = 'src/pages/family/FamilyDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const fullTarget = `      if (clientSession?.id) {
        if (isFirebaseConfigured && db) {
          const q = query(collection(db, 'customers'), where('customerId', '==', clientSession.id));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            setUserData(snapshot.docs[0].data());
          }
        } else {`;

const fixedStr = `      if (clientSession?.id) {
        if (isFirebaseConfigured && db) {
          try {
            const q = query(collection(db, 'customers'), where('customerId', '==', clientSession.id));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              setUserData(snapshot.docs[0].data());
            }
          } catch (err) {
             console.warn("Firebase fetch failed, using local", err);
             const localData = JSON.parse(localStorage.getItem('rakshak_customers') || '[]');
             const user = localData.find((c: any) => c.customerId === clientSession.id);
             if (user) setUserData(user);
          }
        } else {`;

content = content.replace(fullTarget, fixedStr);
fs.writeFileSync(filePath, content);
console.log("Patched FamilyDashboard catch");
