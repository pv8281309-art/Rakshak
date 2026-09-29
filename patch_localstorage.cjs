const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const targetFetch = `  const fetchCustomers = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && db) {
        try {
          const querySnapshot = await getDocs(collection(db, 'customers'));
          const custData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Merge with any existing local state to preserve temp passwords
          setCustomers(prev => {
            const merged = [...custData];
            prev.forEach(p => {
              const idx = merged.findIndex(m => m.id === p.id);
              if (idx === -1) {
                merged.push(p);
              } else if ((p as any)._tempPass) {
                (merged[idx] as any)._tempPass = (p as any)._tempPass;
              }
            });
            return merged;
          });
        } catch (dbErr: any) {
          console.warn('Firestore fetch failed (DB may not be created yet):', dbErr.message);
          // Don't clear local customers if fetch fails (preserves newly created ones)
        }
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
    setLoading(false);
  };`;

const replaceFetch = `  const fetchCustomers = async () => {
    setLoading(true);
    let custData: any[] = [];
    
    // 1. Try fetching from Firestore
    try {
      if (isFirebaseConfigured && db) {
        const querySnapshot = await getDocs(collection(db, 'customers'));
        custData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (dbErr: any) {
      console.warn('Firestore fetch failed:', dbErr.message);
    }
    
    // 2. Fetch from LocalStorage (Fallback / Sync)
    try {
      const localCust = JSON.parse(localStorage.getItem('rakshak_customers') || '[]');
      if (Array.isArray(localCust)) {
        localCust.forEach(lc => {
          if (!custData.find(c => c.id === lc.id)) {
            custData.push(lc);
          }
        });
      }
    } catch (e) {
      console.warn("LocalStorage read failed", e);
    }
    
    // 3. Update state
    setCustomers(prev => {
      const merged = [...custData];
      prev.forEach(p => {
        const idx = merged.findIndex(m => m.id === p.id);
        if (idx === -1) {
          merged.push(p);
        } else if ((p as any)._tempPass) {
          (merged[idx] as any)._tempPass = (p as any)._tempPass;
        }
      });
      return merged;
    });
    
    setLoading(false);
  };`;

c = c.replace(targetFetch, replaceFetch);

// On create customer, save to localStorage
const targetCreate = `      setCustomers(prev => [{ id: formData.customerId, ...customerData, lastLogin: null, _tempPass: tempPass }, ...prev]);`;
const replaceCreate = `      const newCustomer = { id: formData.customerId, ...customerData, lastLogin: null, _tempPass: tempPass };
      setCustomers(prev => {
        const updated = [newCustomer, ...prev];
        localStorage.setItem('rakshak_customers', JSON.stringify(updated));
        
        // Also save a raw auth mapping for the user login portal fallback
        const mockAuth = JSON.parse(localStorage.getItem('rakshak_mock_auth') || '{}');
        mockAuth[formData.customerId] = { password: tempPass, uid: newCustomer.uid, email: newCustomer.email };
        localStorage.setItem('rakshak_mock_auth', JSON.stringify(mockAuth));
        
        return updated;
      });`;

c = c.replace(targetCreate, replaceCreate);

// On status change, update localStorage
const targetStatus = `      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, status: newStatus } : c));`;
const replaceStatus = `      setCustomers(prev => {
        const updated = prev.map(c => c.id === customerId ? { ...c, status: newStatus } : c);
        localStorage.setItem('rakshak_customers', JSON.stringify(updated));
        return updated;
      });`;
c = c.replace(targetStatus, replaceStatus);

// On edit save, update localStorage
const targetEdit = `      setCustomers(prev => prev.map(c => c.id === editCustomer.id ? { ...c, ...editCustomer } : c));
      setEditCustomer(null);`;
const replaceEdit = `      setCustomers(prev => {
        const updated = prev.map(c => c.id === editCustomer.id ? { ...c, ...editCustomer } : c);
        localStorage.setItem('rakshak_customers', JSON.stringify(updated));
        return updated;
      });
      setEditCustomer(null);`;
c = c.replace(targetEdit, replaceEdit);

fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
