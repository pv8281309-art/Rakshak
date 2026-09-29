const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const targetBlock = `                /* SUCCESS SCREEN (Step 5) */
                <div className="flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-rakshak-green/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-rakshak-green" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Customer Access Created Successfully</h2>`;

const replaceBlock = `                /* SUCCESS SCREEN (Step 5) */
                <div className="flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-rakshak-green/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-rakshak-green" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Customer Access Generated Successfully</h2>
                  <p className="text-slate-400 mb-8 max-w-md">The customer account has been created. Please share these credentials securely with the customer.</p>
                  
                  <div className="bg-[#060D1A] border border-slate-700 rounded-lg p-6 w-full max-w-md text-left mb-6 space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Customer ID / Login ID</p>
                      <p className="text-xl font-mono text-rakshak-cyan font-bold">{formData.customerId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Temporary Password</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-mono text-white font-bold tracking-widest">{formData.generatedPassword}</p>
                      </div>
                      <p className="text-[10px] text-red-400 mt-2 italic">* The customer will be forced to change this password on their first login.</p>
                    </div>
                  </div>`;

c = c.replace(targetBlock, replaceBlock);
fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
