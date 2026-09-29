const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');

const regexOverlay = /<div className="px-3 py-1\.5 bg-slate-900\/80 backdrop-blur-md border border-slate-700 rounded-lg flex items-center gap-2 text-xs font-medium text-white shadow-lg">\s*<div className="w-2 h-2 rounded-full bg-rakshak-green"><\/div> Safe \(\{displayVehicles\.filter\(v => v\.status === 'safe'\)\.length\}\)\s*<\/div>\s*<div className="px-3 py-1\.5 bg-slate-900\/80 backdrop-blur-md border border-slate-700 rounded-lg flex items-center gap-2 text-xs font-medium text-white shadow-lg">\s*<div className="w-2 h-2 rounded-full bg-rakshak-orange"><\/div> Warning \(\{displayVehicles\.filter\(v => v\.status === 'warning'\)\.length\}\)\s*<\/div>/g;

content = content.replace(regexOverlay, '');

fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);
