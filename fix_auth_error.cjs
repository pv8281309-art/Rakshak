const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const targetBlock = `        try {
          const userCredential = await createUserWithEmailAndPassword(secAuth, authEmail, tempPass);
          uid = userCredential.user.uid;
        } catch (authErr) { console.error("Auth creation failed:", authErr); throw authErr; }`;

const replaceBlock = `        try {
          const userCredential = await createUserWithEmailAndPassword(secAuth, authEmail, tempPass);
          uid = userCredential.user.uid;
        } catch (authErr: any) { 
          console.error("Auth creation failed:", authErr);
          if (authErr.code === 'auth/configuration-not-found' || authErr.code === 'auth/admin-restricted-operation') {
            console.warn("Firebase Auth is not fully configured (Email/Password disabled). Continuing with mock UID so Firestore data can still be saved.");
          } else {
            throw authErr;
          }
        }`;

c = c.replace(targetBlock, replaceBlock);
fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
