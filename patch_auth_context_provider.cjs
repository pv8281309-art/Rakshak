const fs = require('fs');
const filePath = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('signIn,')) {
  content = content.replace(
    'isMock, setSession }}>',
    'isMock, setSession, signIn }}>'
  );
  fs.writeFileSync(filePath, content);
  console.log("Patched Provider");
} else {
  console.log("Already patched Provider");
}
