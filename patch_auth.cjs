const fs = require('fs');
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

content = content.replace(
  "if (!response.ok) throw new Error(data.error || \"Login failed\");",
  "if (!response.ok) throw new Error(data?.error || \"Login failed\");"
);

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
