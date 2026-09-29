const fs = require('fs');

const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(`const { isMock } = useAuth();`, `const { isMock, setSession } = useAuth();`);

fs.writeFileSync(filePath, content);
