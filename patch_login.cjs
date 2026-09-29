const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetLogic = `      else if (activeTab === 'user') {
        const mockAuth = JSON.parse(localStorage.getItem('rakshak_mock_auth') || '{}');
        const userRec = mockAuth[userId];
        if (userRec && userRec.password === password) {
          const session = { role: 'user', id: userId };
          localStorage.setItem('rakshak_user_session', JSON.stringify(session));
          setSession(session);
          navigate('/user/dashboard');
        } else {
          setError('Invalid User ID or Password');
        }
      }
      else if (activeTab === 'family') {
         if (userId && carNumber && password) {
            const session = { role: 'family', id: userId, car: carNumber };
            localStorage.setItem('rakshak_user_session', JSON.stringify(session));
            setSession(session);
            navigate('/family/dashboard');
         } else {
            setError('Please provide Car Number, User ID, and Password.');
         }
      }
      else if (activeTab === 'hospital') {
        if (userId === 'HOSP-001' && password === 'admin123') {
          const session = { role: 'hospital', id: userId };
          localStorage.setItem('rakshak_user_session', JSON.stringify(session));
          setSession(session);
          navigate('/hospital/dashboard');
        } else {
          setError('Invalid Hospital ID or Password');
        }
      }`;

const replacementLogic = `      else if (activeTab === 'user' || activeTab === 'family' || activeTab === 'hospital') {
        let validLogin = false;
        
        // 1. Try Firebase if configured
        if (isFirebaseConfigured && db) {
          const q = query(collection(db, 'customers'), where('customerId', '==', userId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const customerDoc = querySnapshot.docs[0].data();
            // In a real app, passwords should be hashed. Here we are matching plaintext for prototype.
            if (customerDoc.password === password) {
              if (activeTab === 'family') {
                if (!carNumber || customerDoc.vehicle?.regNo !== carNumber.toUpperCase()) {
                  setError('Invalid Car Number for this user.');
                  setLoading(false);
                  return;
                }
              }
              validLogin = true;
            }
          }
        }
        
        // 2. Try Local Storage fallback
        if (!validLogin) {
          const mockAuth = JSON.parse(localStorage.getItem('rakshak_mock_auth') || '{}');
          const userRec = mockAuth[userId];
          if (userRec && userRec.password === password) {
            if (activeTab === 'family' && !carNumber) {
               setError('Please provide Car Number.');
               setLoading(false);
               return;
            }
            validLogin = true;
          }
        }

        // Hardcoded hospital demo bypass
        if (activeTab === 'hospital' && userId === 'HOSP-001' && password === 'admin123') {
          validLogin = true;
        }

        if (validLogin) {
          const session = { 
            role: activeTab, 
            id: userId, 
            ...(activeTab === 'family' && { car: carNumber }) 
          };
          localStorage.setItem('rakshak_user_session', JSON.stringify(session));
          setSession(session);
          navigate(\`/\${activeTab}/dashboard\`);
        } else {
          setError(\`Invalid \${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ID or Password\`);
        }
      }`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync(filePath, content);
console.log("Patched login logic");
