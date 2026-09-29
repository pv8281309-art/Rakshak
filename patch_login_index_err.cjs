const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetQuery = `        // 1. Try Firebase if configured
        if (isFirebaseConfigured && db) {
          const q = query(collection(db, 'customers'), where('customerId', '==', userId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {`;

const fixedQuery = `        // 1. Try Firebase if configured
        if (isFirebaseConfigured && db) {
          try {
            const q = query(collection(db, 'customers'), where('customerId', '==', userId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const customerDoc = querySnapshot.docs[0].data();
              // In a real app, passwords should be hashed. Here we are matching plaintext for prototype.
              if (customerDoc.password === password) {
                if (activeTab === 'family') {
                  if (!carNumber || customerDoc.vehicle?.regNo !== carNumber.toUpperCase()) {
                    setError('Invalid Car Number for this user.');
                    setLoading(false);
                    return;
                  }
                }
                validLogin = true;
              }
            }
          } catch (fbErr: any) {
            console.warn("Firebase query failed, falling back to local storage:", fbErr);
          }
        }`;

// We need to carefully replace just the if block to avoid syntax errors
const fullTarget = `        // 1. Try Firebase if configured
        if (isFirebaseConfigured && db) {
          const q = query(collection(db, 'customers'), where('customerId', '==', userId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const customerDoc = querySnapshot.docs[0].data();
            // In a real app, passwords should be hashed. Here we are matching plaintext for prototype.
            if (customerDoc.password === password) {
              if (activeTab === 'family') {
                if (!carNumber || customerDoc.vehicle?.regNo !== carNumber.toUpperCase()) {
                  setError('Invalid Car Number for this user.');
                  setLoading(false);
                  return;
                }
              }
              validLogin = true;
            }
          }
        }`;

content = content.replace(fullTarget, fixedQuery);
fs.writeFileSync(filePath, content);
console.log("Patched login query");
