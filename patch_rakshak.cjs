const fs = require('fs');
const files = [
  'src/components/landing/InfoSections.tsx',
  'src/components/landing/BottomSections.tsx',
  'src/components/landing/LandingNavbar.tsx',
  'src/layouts/UserLayout.tsx',
  'src/layouts/AdminLayout.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Rakshak 3\.0/g, 'Rakshak 3.2');
  fs.writeFileSync(file, content);
});
