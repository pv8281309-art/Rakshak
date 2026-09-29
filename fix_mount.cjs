const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const stateTarget = `  const [customers, setCustomers] = useState<any[]>([]);`;
const stateReplacement = `  const [customers, setCustomers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('rakshak_customers');
      return saved ? JSON.parse(saved) : [];
    } catch(e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('rakshak_customers', JSON.stringify(customers));
  }, [customers]);`;
c = c.replace(stateTarget, stateReplacement);

const fetchTarget = `  const fetchCustomers = async () => {
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
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
    setLoading(false);
  };`;

const fetchReplacement = `  const fetchCustomers = async () => {
    setLoading(true);
    
    let custData: any[] = [];
    try {
      if (isFirebaseConfigured && db) {
        const querySnapshot = await getDocs(collection(db, 'customers'));
        custData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (dbErr: any) {
      console.warn('Firestore fetch failed:', dbErr.message);
    }

    setCustomers(prev => {
      const merged = [...custData];
      
      // Also read from localStorage to be absolutely sure we don't lose data
      let localCust = prev;
      try {
        const saved = localStorage.getItem('rakshak_customers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) localCust = parsed;
        }
      } catch(e) {}

      localCust.forEach(p => {
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
c = c.replace(fetchTarget, fetchReplacement);

fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
