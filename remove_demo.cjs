const fs = require('fs');
const filePath = 'src/pages/user/UserLogin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const demoBox = `<div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center mb-4">
              <p className="text-xs text-blue-400 font-medium tracking-wide">
                Demo Credentials: <span className="text-white font-bold">demo</span> / <span className="text-white font-bold">demo</span>
              </p>
            </div>`;

content = content.replace(demoBox, '');
fs.writeFileSync(filePath, content);
console.log("Removed Demo Hint from UserLogin");

const heroPath = 'src/components/landing/HeroSection.tsx';
let heroContent = fs.readFileSync(heroPath, 'utf8');

const heroDemoBox = `{activeTab !== 'admin' && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                <p className="text-xs text-blue-400 font-medium tracking-wide">
                  Demo Credentials: <span className="text-white font-bold">demo</span> / <span className="text-white font-bold">demo</span>
                </p>
              </div>
            )}`;
heroContent = heroContent.replace(heroDemoBox, '');
fs.writeFileSync(heroPath, heroContent);
console.log("Removed Demo Hint from HeroSection");

