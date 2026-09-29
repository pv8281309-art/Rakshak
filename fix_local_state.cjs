const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const target1 = `      if (isFirebaseConfigured && db) {
        try {
          const querySnapshot = await getDocs(collection(db, 'customers'));
          const custData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCustomers(custData);
        } catch (dbErr: any) {
          console.warn('Firestore fetch failed (DB may not be created yet):', dbErr.message);
          setCustomers([]);
        }
      } else {
        setCustomers([]);
      }`;

const replace1 = `      if (isFirebaseConfigured && db) {
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
              } else if (p._tempPass) {
                merged[idx]._tempPass = p._tempPass;
              }
            });
            return merged;
          });
        } catch (dbErr: any) {
          console.warn('Firestore fetch failed (DB may not be created yet):', dbErr.message);
          // Don't clear local customers if fetch fails (preserves newly created ones)
        }
      }`;

c = c.replace(target1, replace1);

const target2 = `  useEffect(() => {
    fetchCustomers();
  }, []);`;
const replace2 = `  useEffect(() => {
    fetchCustomers();
  }, []);

  // Make sure we only show "No customers found" if there are TRULY no customers in state
  const displayedCustomers = customers;`;

c = c.replace(target2, replace2);
fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
