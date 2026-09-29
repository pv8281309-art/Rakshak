const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

const regex = /if \(userData\?\.status === 'emergency' \|\| userData\?\.status === 'responding'\) \{\s*return;\s*\}/m;
content = content.replace(regex, "// Removed early return for debugging");

fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
