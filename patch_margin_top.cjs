const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add a slight margin-top specifically to the login card container to push it down 
// relative to the text on the left, making sure it clears the navbar nicely.
content = content.replace(
    `<div className="flex flex-col items-center justify-center w-full lg:w-auto flex-1 max-w-md lg:max-w-[440px] mx-auto lg:mx-0">`,
    `<div className="flex flex-col items-center justify-center w-full lg:w-auto flex-1 max-w-md lg:max-w-[440px] mx-auto lg:mx-0 lg:mt-6">`
);

fs.writeFileSync(filePath, content);
