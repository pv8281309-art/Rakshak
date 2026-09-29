const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the custom glassmorphism classes with the 'glass-panel' class
content = content.replace(
    `<div className="bg-[#0a0d14]/25 backdrop-blur-3xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-500/20 p-5 lg:p-6">`,
    `<div className="glass-panel rounded-2xl overflow-hidden p-6 lg:p-8 w-full">`
);

// Improve centering and responsive behavior for the hero section
// Increase pt for navbar clearance, adjust flex properties for better centering
content = content.replace(
    `className="relative min-h-screen flex flex-col justify-between pt-20 lg:pt-20 overflow-hidden"`,
    `className="relative min-h-screen flex flex-col justify-center pt-24 lg:pt-32 pb-12 overflow-hidden"`
);

// Ensure the form wrapper is responsive and centered
content = content.replace(
    `<div className="flex flex-col items-center justify-center w-full lg:w-auto flex-1 max-w-md lg:max-w-[440px] mx-auto lg:mx-0">`,
    `<div className="flex flex-col items-center justify-center w-full lg:w-[460px] mx-auto lg:mx-0 shrink-0">`
);


// Adjust the main content row
content = content.replace(
    `<div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-12 lg:py-0">
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-between w-full">`,
    `<div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full h-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-between w-full h-full">`
);

fs.writeFileSync(filePath, content);
