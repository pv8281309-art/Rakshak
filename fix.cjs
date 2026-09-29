const fs = require('fs');
let content = fs.readFileSync('src/components/landing/HeroSection.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('export const HeroSection = () => {')) console.log(i + 1, l);
});
