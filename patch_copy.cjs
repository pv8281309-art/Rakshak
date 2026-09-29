const fs = require('fs');
const filePath = 'src/pages/admin/AccessProvisioning.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `                        <div className="text-lg font-mono text-rakshak-cyan mt-1 select-all">{formData.generatedPassword}</div>
                      </div>`;

const fixed = `                        <div className="flex items-center gap-3 mt-1">
                          <div className="text-lg font-mono text-rakshak-cyan select-all">{formData.generatedPassword}</div>
                          <button 
                            onClick={() => navigator.clipboard.writeText(formData.generatedPassword)}
                            className="p-1.5 bg-rakshak-cyan/10 hover:bg-rakshak-cyan/20 text-rakshak-cyan rounded-md transition-colors"
                            title="Copy Password"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
                        </div>
                      </div>`;

content = content.replace(target, fixed);

const targetReset = `<div className="bg-[#020617] p-3 rounded-lg border border-slate-700 mb-6 text-center">
                           <span className="text-2xl font-mono text-rakshak-cyan select-all">{resetPasswordState.newPassword}</span>
                         </div>`;

const fixedReset = `<div className="bg-[#020617] p-3 rounded-lg border border-slate-700 mb-6 text-center flex items-center justify-between">
                           <span className="text-2xl font-mono text-rakshak-cyan select-all">{resetPasswordState.newPassword}</span>
                           <button 
                             onClick={() => navigator.clipboard.writeText(resetPasswordState.newPassword)}
                             className="p-2 bg-rakshak-cyan/10 hover:bg-rakshak-cyan/20 text-rakshak-cyan rounded-md transition-colors"
                             title="Copy Password"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                           </button>
                         </div>`;

content = content.replace(targetReset, fixedReset);

fs.writeFileSync(filePath, content);
console.log("Patched Copy buttons");
