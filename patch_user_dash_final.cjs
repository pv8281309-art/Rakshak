const fs = require('fs');
const filePath = 'src/pages/user/UserDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `        if (isFirebaseConfigured && db) {
          try {
            const q = query(collection(db, 'customers'), where('customerId', '==', clientSession.id));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              setUserData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {`;

const fixedStr = `        if (isFirebaseConfigured && db) {
          try {
            // Manual filter to bypass index error
            const q = query(collection(db, 'customers'));
            const snapshot = await getDocs(q);
            const matchingDoc = snapshot.docs.find(doc => doc.data().customerId === clientSession.id);
            if (matchingDoc) {
              setUserData({ id: matchingDoc.id, ...matchingDoc.data() });
            } else {`;

content = content.replace(targetStr, fixedStr);
fs.writeFileSync(filePath, content);
console.log("Patched UserDashboard index issue");
