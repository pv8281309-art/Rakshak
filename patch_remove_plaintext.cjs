const fs = require('fs');
const filePath = 'src/pages/admin/AccessProvisioning.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("password: pass, // Stored to allow user login demo", "");
fs.writeFileSync(filePath, content);
console.log("Removed plaintext password from customerData");
