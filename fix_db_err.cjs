const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

c = c.replace(/\} catch \(dbErr\) \{ console\.error\(dbErr\); throw dbErr; \}/g, '} catch (dbErr) { console.error("Firestore Error:", dbErr); throw dbErr; }');

fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
