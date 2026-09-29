const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

// Add imports
c = c.replace(
  "import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';",
  "import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';"
);

// Add states
const stateTarget = `  const [viewCustomer, setViewCustomer] = useState<any>(null);`;
const stateReplacement = `  const [viewCustomer, setViewCustomer] = useState<any>(null);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);`;
c = c.replace(stateTarget, stateReplacement);

// Add action functions
const actionTarget = `  const handleStatusChange = async (customerId: string, newStatus: string) => {`;
const actionReplacement = `  const handleResetPassword = async (customer: any) => {
    if (!customer.email || customer.email.includes('@rakshak.internal')) {
      alert("This customer does not have a valid email address configured for password reset.");
      return;
    }
    
    if (confirm(\`Send password reset email to \${customer.email}?\`)) {
      try {
        const primaryAuth = getAuth(); // Main app auth
        if (primaryAuth) {
          await sendPasswordResetEmail(primaryAuth, customer.email);
          alert("Password reset email sent successfully!");
        } else {
          alert("Auth is not fully initialized.");
        }
      } catch (err: any) {
        console.error("Password reset error:", err);
        alert("Failed to send reset email: " + err.message);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editCustomer) return;
    setIsSavingEdit(true);
    try {
      if (db) {
        await updateDoc(doc(db, 'customers', editCustomer.id), {
          name: editCustomer.name,
          mobile: editCustomer.mobile,
          email: editCustomer.email,
          address: editCustomer.address,
          city: editCustomer.city,
          state: editCustomer.state,
          pinCode: editCustomer.pinCode,
          vehicleReg: editCustomer.vehicleReg
        });
        
        await setDoc(doc(collection(db, 'auditLogs')), {
          action: 'CUSTOMER_EDITED',
          targetId: editCustomer.id,
          timestamp: serverTimestamp(),
          adminUid: 'admin'
        });
      }
      
      setCustomers(prev => prev.map(c => c.id === editCustomer.id ? { ...c, ...editCustomer } : c));
      setEditCustomer(null);
    } catch (err: any) {
      console.error("Failed to update customer:", err);
      alert("Failed to save changes: " + err.message);
    }
    setIsSavingEdit(false);
  };

  const handleStatusChange = async (customerId: string, newStatus: string) => {`;
c = c.replace(actionTarget, actionReplacement);

// Update buttons in table
const buttonsTarget = `                      <button onClick={() => setViewCustomer(customer)} className="p-1.5 text-slate-400 hover:text-rakshak-cyan hover:bg-rakshak-cyan/10 rounded" title="View Profile"><Eye size={16} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded" title="Edit"><Edit2 size={16} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded" title="Reset Password"><RefreshCw size={16} /></button>`;
const buttonsReplacement = `                      <button onClick={() => setViewCustomer(customer)} className="p-1.5 text-slate-400 hover:text-rakshak-cyan hover:bg-rakshak-cyan/10 rounded" title="View Profile"><Eye size={16} /></button>
                      <button onClick={() => setEditCustomer({...customer})} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded" title="Edit"><Edit2 size={16} /></button>
                      <button onClick={() => handleResetPassword(customer)} className="p-1.5 text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded" title="Reset Password"><RefreshCw size={16} /></button>`;
c = c.replace(buttonsTarget, buttonsReplacement);

// Add Edit Modal at the end of the file
const endTarget = `    </div>
  );
}`;
const endReplacement = `      {/* Edit Customer Modal */}
      <AnimatePresence>
        {editCustomer && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#060D1A]/90 backdrop-blur-sm" onClick={() => !isSavingEdit && setEditCustomer(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0A1122] border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-slate-800/30">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  Edit Customer
                  <span className="font-mono text-rakshak-cyan text-xs bg-rakshak-cyan/10 border border-rakshak-cyan/20 px-2 py-1 rounded">
                    {editCustomer.id}
                  </span>
                </h2>
                <button onClick={() => !isSavingEdit && setEditCustomer(null)} className="text-slate-400 hover:text-white p-1"><X size={20}/></button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label><input type="text" value={editCustomer.name || ''} onChange={e => setEditCustomer({...editCustomer, name: e.target.value})} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none" /></div>
                  <div><label className="block text-xs font-medium text-slate-400 mb-1">Mobile</label><input type="text" value={editCustomer.mobile || ''} onChange={e => setEditCustomer({...editCustomer, mobile: e.target.value})} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none" /></div>
                  <div><label className="block text-xs font-medium text-slate-400 mb-1">Email</label><input type="email" value={editCustomer.email || ''} onChange={e => setEditCustomer({...editCustomer, email: e.target.value})} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none" /></div>
                  <div><label className="block text-xs font-medium text-slate-400 mb-1">Vehicle Reg</label><input type="text" value={editCustomer.vehicleReg || ''} onChange={e => setEditCustomer({...editCustomer, vehicleReg: e.target.value})} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none uppercase font-mono" /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-400 mb-1">Address</label><input type="text" value={editCustomer.address || ''} onChange={e => setEditCustomer({...editCustomer, address: e.target.value})} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none" /></div>
                  <div><label className="block text-xs font-medium text-slate-400 mb-1">City</label><input type="text" value={editCustomer.city || ''} onChange={e => setEditCustomer({...editCustomer, city: e.target.value})} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none" /></div>
                  <div><label className="block text-xs font-medium text-slate-400 mb-1">State / PIN</label>
                    <div className="flex gap-2">
                      <input type="text" value={editCustomer.state || ''} onChange={e => setEditCustomer({...editCustomer, state: e.target.value})} className="w-1/2 bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none" placeholder="State" />
                      <input type="text" value={editCustomer.pinCode || editCustomer.pin || ''} onChange={e => setEditCustomer({...editCustomer, pinCode: e.target.value})} className="w-1/2 bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-rakshak-cyan outline-none" placeholder="PIN" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex items-center justify-end gap-3">
                <button onClick={() => setEditCustomer(null)} disabled={isSavingEdit} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
                <button onClick={handleSaveEdit} disabled={isSavingEdit} className="flex items-center gap-2 px-5 py-2 bg-rakshak-cyan hover:bg-rakshak-cyan/90 text-slate-900 rounded-lg font-bold transition-colors disabled:opacity-50">
                  {isSavingEdit ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}`;
c = c.replace(endTarget, endReplacement);

fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
