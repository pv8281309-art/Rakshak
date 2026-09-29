const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

c = c.replace(
  'const authEmail = formData.email || `${formData.customerId.toLowerCase()}@rakshak.internal`;',
  'const authEmail = (formData.email || "").trim() || `${formData.customerId.toLowerCase()}@rakshak.internal`;'
);

const targetBlock = `        } catch (authErr: any) { 
          console.error("Auth creation failed:", authErr);
          // If the admin hasn't enabled Email/Password auth in the Firebase Console,
          // throw the error so they know why users aren't showing up.
          alert("Firebase Authentication Error: Please go to your Firebase Console (Authentication -> Sign-in method) and enable 'Email/Password' provider.");
          throw authErr;
        }`;

const replaceBlock = `        } catch (authErr: any) { 
          console.error("Auth creation failed:", authErr);
          if (authErr.code === 'auth/invalid-email') {
            alert("Firebase Authentication Error: The email address is badly formatted. Please provide a valid email address.");
          } else {
            alert("Firebase Authentication Error: Please go to your Firebase Console (Authentication -> Sign-in method) and enable 'Email/Password' provider.");
          }
          throw authErr;
        }`;

c = c.replace(targetBlock, replaceBlock);
fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
