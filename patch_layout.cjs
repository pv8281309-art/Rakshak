const fs = require('fs');

const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the Main Content wrapper
const oldMainWrapper = `<div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-10 lg:pb-16 pt-8 lg:pt-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-4 lg:gap-12 items-center justify-between">`;

const newMainWrapper = `<div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-12 lg:py-0">
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-between w-full">`;

content = content.replace(oldMainWrapper, newMainWrapper);

// Also handle the case where it might be slightly different
const fallbackOldMainWrapper = `<div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-10 lg:pb-16 pt-8 lg:pt-12">`;
if(!content.includes(newMainWrapper)) {
    content = content.replace(fallbackOldMainWrapper, `<div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-12 lg:py-0">`);
}

const fallbackRowWrapper = `<div className="flex flex-col md:flex-row gap-8 md:gap-4 lg:gap-12 items-center justify-between">`;
if(!content.includes(newMainWrapper) && content.includes(fallbackRowWrapper)) {
     content = content.replace(fallbackRowWrapper, `<div className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-center justify-between w-full">`);
}


// Replace the Right Side Login Cards wrapper
const oldRightSide = `{/* Right Side: Login Cards */}
          <div className="flex flex-col items-center justify-center md:justify-end lg:justify-center w-full md:w-auto flex-1 max-w-md lg:max-w-[460px] mx-auto md:mx-0 mt-6 lg:mt-12">`;

const newRightSide = `{/* Right Side: Login Cards */}
          <div className="flex flex-col items-center justify-center w-full lg:w-auto flex-1 max-w-md lg:max-w-[440px] mx-auto lg:mx-0">`;

content = content.replace(oldRightSide, newRightSide);

fs.writeFileSync(filePath, content);
