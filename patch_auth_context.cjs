const fs = require('fs');
const filePath = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Update AuthContextType interface
content = content.replace(
  'setSession: (session: any) => void;',
  'setSession: (session: any) => void;\n  signIn: (userId: string, password: string, role: string, extra?: any) => Promise<boolean>;'
);

// Update default context value
content = content.replace(
  'setSession: () => {},',
  'setSession: () => {},\n  signIn: async () => false,'
);

// Add signIn implementation
const signInImpl = `
  const signIn = async (userId: string, password: string, activeRole: string, extra?: any): Promise<boolean> => {
    let validLogin = false;
    
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'customers'));
        const querySnapshot = await getDocs(q);
        const matchingDoc = querySnapshot.docs.find(doc => doc.data().customerId === userId);
        
        if (matchingDoc) {
          const customerDoc = matchingDoc.data();
          if (customerDoc.password === password) {
            if (activeRole === 'family') {
              if (!extra?.carNumber || customerDoc.vehicle?.regNo !== extra.carNumber.toUpperCase()) {
                return false;
              }
            }
            validLogin = true;
          }
        }
      } catch (fbErr: any) {
        console.warn("Firebase query failed, falling back to local storage:", fbErr);
      }
    }

    if (!validLogin) {
      // Local fallback
      const localCustomersStr = localStorage.getItem('rakshak_customers');
      if (localCustomersStr) {
        const localCustomers = JSON.parse(localCustomersStr);
        const user = localCustomers.find((c: any) => c.customerId === userId && c.password === password);
        if (user) {
          if (activeRole === 'family' && extra?.carNumber && user.vehicle?.regNo !== extra.carNumber.toUpperCase()) {
            return false;
          }
          validLogin = true;
        }
      }
    }

    if (validLogin) {
      const session = { 
        role: activeRole, 
        id: userId,
        ...(activeRole === 'family' && extra?.carNumber ? { car: extra.carNumber.toUpperCase() } : {})
      };
      localStorage.setItem('rakshak_user_session', JSON.stringify(session));
      setClientSession(session);
      return true;
    }
    return false;
  };
`;

content = content.replace(
  'const setSession = (session: any) => {',
  signInImpl + '\n  const setSession = (session: any) => {'
);

fs.writeFileSync(filePath, content);
console.log("Patched AuthContext.tsx");
