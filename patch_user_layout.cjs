const fs = require('fs');
let content = fs.readFileSync('src/layouts/UserLayout.tsx', 'utf8');

// Remove "User Portal" from sidebar
content = content.replace('<p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">User Portal</p>', '');

// Remove text from top right
content = content.replace(
`<div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white leading-tight">User</p>
                  <p className="text-[10px] text-slate-400">{clientSession?.id || \'Portal\'}</p>
                </div>`, '');

fs.writeFileSync('src/layouts/UserLayout.tsx', content);
