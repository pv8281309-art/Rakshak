const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const targetBlock = `        } catch (authErr: any) { 
          console.error("Auth creation failed:", authErr);
          console.warn("Firebase Auth failed (possibly not configured or email already exists). Continuing with mock UID so Firestore data can still be saved.");
          // No longer throwing authErr to ensure provisioning always succeeds even if Auth is off
        }`;

const replaceBlock = `        } catch (authErr: any) { 
          console.error("Auth creation failed:", authErr);
          // If the admin hasn't enabled Email/Password auth in the Firebase Console,
          // throw the error so they know why users aren't showing up.
          alert("Firebase Authentication Error: Please go to your Firebase Console (Authentication -> Sign-in method) and enable 'Email/Password' provider.");
          throw authErr;
        }`;

c = c.replace(targetBlock, replaceBlock);
fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
