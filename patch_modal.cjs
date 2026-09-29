const fs = require('fs');
const filePath = 'src/pages/admin/AccessProvisioning.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetModalEnd = `                {viewCustomer.emergencyContacts && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Emergency Contacts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       {viewCustomer.emergencyContacts.map((contact: any, i: number) => (
                          <div key={i} className="bg-[#060D1A] p-3 rounded-lg border border-slate-700/50">
                            <p className="text-xs font-bold text-rakshak-cyan">{contact.relation}</p>
                            <p className="text-sm text-white my-0.5">{contact.name}</p>
                            <p className="text-xs font-mono text-slate-400">{contact.mobile}</p>
                          </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>`;

const fixedModalEnd = `                {viewCustomer.emergencyContacts && (
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Emergency Contacts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       {viewCustomer.emergencyContacts.map((contact: any, i: number) => (
                          <div key={i} className="bg-[#060D1A] p-3 rounded-lg border border-slate-700/50">
                            <p className="text-xs font-bold text-rakshak-cyan">{contact.relation}</p>
                            <p className="text-sm text-white my-0.5">{contact.name}</p>
                            <p className="text-xs font-mono text-slate-400">{contact.mobile}</p>
                          </div>
                       ))}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex gap-3 flex-wrap">
                  <button 
                    onClick={() => handleResetPassword(viewCustomer.customerId)}
                    disabled={isProvisioning}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Reset Password
                  </button>
                  {viewCustomer.status === 'disabled' ? (
                    <button 
                      onClick={() => handleToggleStatus(viewCustomer.customerId, 'active')}
                      disabled={isProvisioning}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Enable Account
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleToggleStatus(viewCustomer.customerId, 'disabled')}
                      disabled={isProvisioning}
                      className="px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Disable Account
                    </button>
                  )}
                </div>

              </div>
            </motion.div>

            {/* Reset Password Modal */}
            <AnimatePresence>
              {resetPasswordState && resetPasswordState.customerId === viewCustomer.customerId && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-2xl">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
                    {!resetPasswordState.newPassword ? (
                       <>
                         <h3 className="text-lg font-bold text-white mb-2">Reset Password?</h3>
                         <p className="text-sm text-slate-400 mb-6">The user's current password will immediately become invalid. A new temporary password will be generated, and the user will be required to create a new password at their next login.</p>
                         <div className="flex gap-3 justify-end">
                           <button onClick={() => setResetPasswordState(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium">Cancel</button>
                           <button onClick={() => confirmResetPassword(viewCustomer.customerId)} disabled={isProvisioning} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold">Confirm Reset</button>
                         </div>
                       </>
                    ) : (
                       <>
                         <h3 className="text-lg font-bold text-white mb-2">New Temporary Password</h3>
                         <div className="bg-[#020617] p-3 rounded-lg border border-slate-700 mb-6 text-center">
                           <span className="text-2xl font-mono text-rakshak-cyan select-all">{resetPasswordState.newPassword}</span>
                         </div>
                         <button onClick={() => setResetPasswordState(null)} className="w-full px-4 py-3 bg-rakshak-cyan hover:bg-rakshak-cyan/90 text-slate-900 rounded-lg text-sm font-bold">Done</button>
                       </>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}
      </AnimatePresence>`;

content = content.replace(targetModalEnd, fixedModalEnd);

// Also need to add state for resetPasswordState and handlers
const targetImports = `const [searchQuery, setSearchQuery] = useState('');`;

const fixedImports = `const [searchQuery, setSearchQuery] = useState('');
  const [resetPasswordState, setResetPasswordState] = useState<any>(null);

  const handleResetPassword = (customerId: string) => {
    setResetPasswordState({ customerId, newPassword: null });
  };

  const confirmResetPassword = async (customerId: string) => {
    setIsProvisioning(true);
    const pass = generatePassword();
    try {
      const res = await fetch('/api/auth/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, newPassword: pass, adminId: 'ADMIN' })
      });
      if (!res.ok) throw new Error('Reset failed');
      setResetPasswordState({ customerId, newPassword: pass });
      
      // Update local state
      setCustomers(customers.map(c => c.customerId === customerId ? { ...c, requiresPasswordChange: true } : c));
      if (viewCustomer) setViewCustomer({ ...viewCustomer, requiresPasswordChange: true });
    } catch (e) {
      console.error(e);
      alert('Failed to reset password');
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleToggleStatus = async (customerId: string, status: string) => {
    setIsProvisioning(true);
    try {
      const res = await fetch('/api/auth/changeStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, status, adminId: 'ADMIN' })
      });
      if (!res.ok) throw new Error('Status change failed');
      
      setCustomers(customers.map(c => c.customerId === customerId ? { ...c, status } : c));
      if (viewCustomer) setViewCustomer({ ...viewCustomer, status });
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    } finally {
      setIsProvisioning(false);
    }
  };`;

content = content.replace(targetImports, fixedImports);

fs.writeFileSync(filePath, content);
console.log("Patched AccessProvisioning with Action Buttons");
