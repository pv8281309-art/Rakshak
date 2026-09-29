const fs = require('fs');

const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Shift the entire section UP (reduce pt-28 lg:pt-32 to pt-20 lg:pt-20)
content = content.replace(
    `className="relative min-h-screen flex flex-col justify-between pt-28 lg:pt-32 overflow-hidden"`,
    `className="relative min-h-screen flex flex-col justify-between pt-20 lg:pt-20 overflow-hidden"`
);

// 2. Remove the margin top (lg:mt-6) from the form wrapper
content = content.replace(
    `<div className="flex flex-col items-center justify-center w-full lg:w-auto flex-1 max-w-md lg:max-w-[440px] mx-auto lg:mx-0 lg:mt-6">`,
    `<div className="flex flex-col items-center justify-center w-full lg:w-auto flex-1 max-w-md lg:max-w-[440px] mx-auto lg:mx-0">`
);

// 3. Make the form background MORE transparent & adjust padding to shrink height slightly
content = content.replace(
    `<div className="bg-[#0f172a]/40 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 p-6 lg:p-7">`,
    `<div className="bg-[#0a0d14]/25 backdrop-blur-3xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-500/20 p-5 lg:p-6">`
);

// 4. Slightly shrink vertical gaps (mb-5 -> mb-4)
content = content.replace(
    `<div className="flex flex-col items-center justify-center gap-3 mb-5 text-center">`,
    `<div className="flex flex-col items-center justify-center gap-2 mb-4 text-center">`
);

content = content.replace(
    `<div className="flex bg-[#0B0F19]/50 p-1 rounded-lg mb-5 border border-slate-700/50 backdrop-blur-md">`,
    `<div className="flex bg-[#0B0F19]/40 p-1 rounded-lg mb-4 border border-slate-700/50 backdrop-blur-md">`
);

// 5. Shrink Logo size slightly to save space
content = content.replace(
    `<div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-2xl border border-slate-700/50 flex items-center justify-center p-1.5 shadow-lg shrink-0">`,
    `<div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-2xl border border-slate-700/50 flex items-center justify-center p-1 shadow-lg shrink-0">`
);

// 6. Reduce form element height slightly (py-2.5 -> py-2)
content = content.replaceAll(`py-2.5`, `py-2`);
// 7. Reduce spacey-3.5 -> space-y-3
content = content.replaceAll(`space-y-3.5`, `space-y-3`);

fs.writeFileSync(filePath, content);
