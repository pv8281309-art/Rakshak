const fs = require('fs');
const filePath = 'src/pages/family/FamilyDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `        if (isFirebaseConfigured && db) {
          try {
            const q = query(collection(db, 'customers'), where('customerId', '==', clientSession.id));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              setUserData(snapshot.docs[0].data());
            }
          } catch (err) {`;

const fixedStr = `        if (isFirebaseConfigured && db) {
          try {
            const q = query(collection(db, 'customers'));
            const snapshot = await getDocs(q);
            const matchingDoc = snapshot.docs.find(doc => doc.data().customerId === clientSession.id);
            if (matchingDoc) {
              setUserData(matchingDoc.data());
            }
          } catch (err) {`;

content = content.replace(targetStr, fixedStr);
fs.writeFileSync(filePath, content);
console.log("Patched FamilyDashboard index issue");
