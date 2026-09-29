const fs = require('fs');
let content = fs.readFileSync('src/pages/user/EmergencyContacts.tsx', 'utf8');

content = content.replace("className=\"bg-[#020617]/50 border border-slate-800 hover:border-slate-600 p-4 rounded-xl flex items-center justify-between group transition-all opacity-80 cursor-not-allowed pointer-events-none\"",
"className=\"bg-[#020617]/50 border border-slate-800 hover:border-slate-600 p-4 rounded-xl flex items-center justify-between group transition-all\"");

fs.writeFileSync('src/pages/user/EmergencyContacts.tsx', content);
