const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const targetBlock = `        } catch (dbErr: any) { 
          console.error("Firestore Error:", dbErr); 
          // Do not throw here. If Firestore fails (e.g. database not created in console), 
          // we still want to show the success screen with the mock data so the user isn't stuck.
        }`;

const replaceBlock = `        } catch (dbErr: any) { 
          console.error("Firestore Error:", dbErr); 
          alert("Firestore Database Error: Please make sure you have clicked 'Create Database' in your Firebase Console under Firestore Database.");
          throw dbErr;
        }`;

c = c.replace(targetBlock, replaceBlock);
fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
