const fs = require('fs');
const filePath = 'src/pages/admin/AccessProvisioning.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'customers', formData.customerId), customerData);
      }`;

const replacementStr = `      if (isFirebaseConfigured && db) {
        try {
          // Remove createdAt before setting to local state if serverTimestamp is used, but we need it for Firestore
          await setDoc(doc(db, 'customers', formData.customerId), customerData);
        } catch (fbError) {
          console.warn("Firebase provisioning failed, continuing with local storage:", fbError);
        }
      }`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(filePath, content);
console.log("Patched AccessProvisioning");
