const fs = require('fs');
let code = fs.readFileSync('patch_user_dash_realtime.cjs', 'utf8');
let start = code.indexOf('const newContent = `');
let contentStr = code.substring(start + 20);
let end = contentStr.lastIndexOf('`;');
let finalContent = contentStr.substring(0, end);
fs.writeFileSync('src/pages/user/UserDashboard.tsx', finalContent);
console.log("Restored user dashboard.");
