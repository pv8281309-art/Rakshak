const fs = require('fs');
const filePath = 'server.ts';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      res.json({ 
        success: true, 
        user: { 
          id: userData.customerId, 
          role: userData.role,
          requiresPasswordChange: userData.requiresPasswordChange
        } 
      });`;

const fixed = `      res.json({ 
        success: true, 
        user: { 
          id: userData.customerId, 
          role: userData.role,
          requiresPasswordChange: userData.requiresPasswordChange,
          vehicleReg: userData.vehicle?.regNo
        } 
      });`;

content = content.replace(target, fixed);
fs.writeFileSync(filePath, content);
console.log("Patched server.ts with vehicleReg");
