const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

// The file was written with literal backslashes from a previous string literal escaping gone wrong.
// We'll replace all literal \` with `
// and \${ with ${
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$\{/g, '${');

fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
