const fs = require('fs');
const filePath = 'src/pages/user/UserLogin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `<a href="#" className="text-xs text-rakshak-cyan hover:text-white transition-colors">Forgot Password?</a>`;
const fixed = `<button type="button" onClick={() => alert("Please contact your administrator to reset your password.")} className="text-xs text-rakshak-cyan hover:text-white transition-colors">Forgot Password?</button>`;

content = content.replace(target, fixed);
fs.writeFileSync(filePath, content);
console.log("Patched Forgot Password");
