const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

c = c.replace(/\} catch \(dbErr\) \{ console\.error\("Firestore Error:", dbErr\); throw dbErr; \}/g, `} catch (dbErr: any) { 
          console.error("Firestore Error:", dbErr); 
          // Soft fail for Firestore errors so the UI can proceed
        }`);

fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
