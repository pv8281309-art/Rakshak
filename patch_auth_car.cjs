const fs = require('fs');
const filePath = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      if (data.success) {
        const session = {`;

const fixed = `      if (data.success) {
        if (activeRole === 'family') {
          if (!extra?.carNumber || data.user.vehicleReg !== extra.carNumber.toUpperCase()) {
             throw new Error("Invalid Car Number for this user.");
          }
        }
        const session = {`;

content = content.replace(target, fixed);
fs.writeFileSync(filePath, content);
console.log("Patched AuthContext with car check");
