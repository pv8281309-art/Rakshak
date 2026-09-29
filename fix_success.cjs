const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const targetBlock = `                /* SUCCESS SCREEN (Step 5) */
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
                  </div>
                  <p className="text-sm text-slate-400 mb-8 max-w-md">The account has been provisioned and mapped to Firebase Authentication. The customer will be forced to change this password on first login.</p>
                  
                  <div className="w-full max-w-sm space-y-4 text-left bg-[#060D1A] border border-slate-700 rounded-xl p-5 mb-6">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Customer ID</p>
                      <div className="flex items-center justify-between bg-slate-900 rounded-md px-3 py-2 border border-slate-800">
                        <span className="font-mono text-rakshak-cyan font-bold">{formData.customerId}</span>
                        <button onClick={() => copyToClipboard(formData.customerId)} className="text-slate-400 hover:text-white"><Copy size={14}/></button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Temporary Password</p>
                      <div className="flex items-center justify-between bg-slate-900 rounded-md px-3 py-2 border border-slate-800">
                        <span className="font-mono text-white font-bold">{formData.generatedPassword}</span>
                        <button onClick={() => copyToClipboard(formData.generatedPassword)} className="text-slate-400 hover:text-white"><Copy size={14}/></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Account Status</p>
                      <span className="text-xs font-bold text-rakshak-green flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-rakshak-green rounded-full"></div> Active</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-left max-w-md w-full mb-8">
                    <AlertCircle className="text-orange-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-[11px] text-orange-200 leading-tight">Save or securely share these credentials with the customer. The temporary password will not be displayed again.</p>
                  </div>`;

const replaceBlock = `                /* SUCCESS SCREEN (Step 5) */
                <div className="flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-rakshak-green/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} className="text-rakshak-green" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Customer Access Generated Successfully</h2>
                  <p className="text-sm text-slate-400 mb-6 max-w-md">The account has been provisioned and mapped to Firebase Authentication. Please share these credentials securely with the customer.</p>
                  
                  <div className="w-full max-w-sm space-y-4 text-left bg-[#060D1A] border border-slate-700 rounded-xl p-5 mb-6">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Customer ID / Login ID</p>
                      <div className="flex items-center justify-between bg-slate-900 rounded-md px-3 py-2 border border-slate-800">
                        <span className="font-mono text-rakshak-cyan text-lg font-bold">{formData.customerId}</span>
                        <button onClick={() => copyToClipboard(formData.customerId)} className="text-slate-400 hover:text-white"><Copy size={16}/></button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Temporary Password</p>
                      <div className="flex items-center justify-between bg-slate-900 rounded-md px-3 py-2 border border-slate-800">
                        <span className="font-mono text-white text-lg font-bold tracking-widest">{formData.generatedPassword}</span>
                        <button onClick={() => copyToClipboard(formData.generatedPassword)} className="text-slate-400 hover:text-white"><Copy size={16}/></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Account Status</p>
                      <span className="text-xs font-bold text-rakshak-green flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-rakshak-green rounded-full"></div> Active</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-left max-w-md w-full mb-8">
                    <AlertCircle className="text-orange-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-[11px] text-orange-200 leading-tight">Save or securely share these credentials with the customer. The temporary password will not be displayed again, and the customer will be forced to change it on their first login.</p>
                  </div>`;

c = c.replace(targetBlock, replaceBlock);
fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
