const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AlertsSOS.tsx', 'utf8');

const target1 = `const newOnes = merged.filter(m => m.status === 'new' && !prev.find(p => p.id === m.id));`;
const replacement1 = `const newOnes = merged.filter(m => (m as any).status === 'new' && !prev.find(p => p.id === m.id));`;
c = c.replace(target1, replacement1);

fs.writeFileSync('src/pages/admin/AlertsSOS.tsx', c);
