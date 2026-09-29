const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `        // 1. Try Firebase if configured
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

const fixedStr = `        // 1. Try Firebase if configured
        if (isFirebaseConfigured && db) {
          try {
            // Fetch ALL customers first, then filter manually to bypass missing index error
            const q = query(collection(db, 'customers'));
            const querySnapshot = await getDocs(q);
            
            // Manual filter since index on customerId is missing
            const matchingDoc = querySnapshot.docs.find(doc => doc.data().customerId === userId);
            
            if (matchingDoc) {
              const customerDoc = matchingDoc.data();
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

content = content.replace(targetStr, fixedStr);
fs.writeFileSync(filePath, content);
console.log("Patched HeroSection missing index issue on login");
