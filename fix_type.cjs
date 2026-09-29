const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AlertsSOS.tsx', 'utf8');

const target = `const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.timestamp || 0);
          const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.timestamp || 0);`;

const rep = `const tA = (a as any).createdAt?.seconds ? (a as any).createdAt.seconds * 1000 : ((a as any).timestamp || 0);
          const tB = (b as any).createdAt?.seconds ? (b as any).createdAt.seconds * 1000 : ((b as any).timestamp || 0);`;

c = c.replace(target, rep);
fs.writeFileSync('src/pages/admin/AlertsSOS.tsx', c);
