const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetLogic = `        let validLogin = false;
        
        // 1. Try Firebase if configured`;

const fixedLogic = `        let validLogin = false;
        
        // DEMO OVERRIDE
        if (userId.toLowerCase() === 'demo' && password === 'demo') {
           validLogin = true;
        }

        // 1. Try Firebase if configured`;

content = content.replace(targetLogic, fixedLogic);

const targetHint = `            <div className="mt-4 flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-400 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-slate-700 bg-slate-900/50 text-blue-500 focus:ring-blue-500/50" defaultChecked />
                Remember me
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
            </div>`;

const fixedHint = `            <div className="mt-4 flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-400 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-slate-700 bg-slate-900/50 text-blue-500 focus:ring-blue-500/50" defaultChecked />
                Remember me
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
            </div>
            
            {activeTab !== 'admin' && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                <p className="text-xs text-blue-400 font-medium tracking-wide">
                  Demo Credentials: <span className="text-white font-bold">demo</span> / <span className="text-white font-bold">demo</span>
                </p>
              </div>
            )}`;

content = content.replace(targetHint, fixedHint);

fs.writeFileSync(filePath, content);
console.log("Patched HeroSection with Demo override and Hint");
