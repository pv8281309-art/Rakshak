const fs = require('fs');
const filePath = 'src/pages/admin/AccessProvisioning.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `        const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));`;
const fixedStr = `        // Drop orderBy to avoid missing index error in Firebase
        const q = query(collection(db, 'customers'));`;

content = content.replace(targetStr, fixedStr);
fs.writeFileSync(filePath, content);
console.log("Patched AccessProvisioning query 2");
