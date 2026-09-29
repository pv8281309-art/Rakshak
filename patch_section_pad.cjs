const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Increase the padding top of the whole section to give more clearance from the navbar
content = content.replace(
    `<section id="home" className="relative min-h-screen flex flex-col justify-between pt-24 overflow-hidden">`,
    `<section id="home" className="relative min-h-screen flex flex-col justify-between pt-28 lg:pt-32 overflow-hidden">`
);

// Also add a little bit of margin to the form container itself to balance it out if needed, 
// let's just make sure the flex-1 is centering it perfectly
fs.writeFileSync(filePath, content);
