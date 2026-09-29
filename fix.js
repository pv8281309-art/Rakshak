const fs = require('fs');
let content = fs.readFileSync('src/components/landing/HeroSection.tsx', 'utf8');

// I will output the file to a temporary location so I can see it.
fs.writeFileSync('hero.txt', content);
