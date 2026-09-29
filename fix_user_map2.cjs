const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

// I'll remove the fake path SVG and UI completely.
const svgRegex = /<svg[\s\S]*?<\/svg>/;
content = content.replace(svgRegex, '');

const fakeOverlay = /<div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500 gap-4">[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(fakeOverlay, '');

fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
