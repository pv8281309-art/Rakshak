const fs = require('fs');
let authPath = 'src/contexts/AuthContext.tsx';
let ac = fs.readFileSync(authPath, 'utf8');

// I will rebuild the core of onAuthStateChanged from scratch to avoid brace issues.
const startMarker = "const unsubscribe = onAuthStateChanged(auth, async (user) => {";
const endMarker = "    return () => unsubscribe();";

const newContent = `    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setAdminUser({
              id: userDoc.id,
              uid: user.uid,
              email: user.email || '',
              displayName: data.displayName || '',
              role: data.role as Role,
              status: data.status || 'active',
              lastActive: data.lastActive,
              createdAt: data.createdAt,
            });
          } else {
            setAdminUser(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();`;

ac = ac.substring(0, ac.indexOf(startMarker)) + newContent + ac.substring(ac.indexOf(endMarker) + endMarker.length);
fs.writeFileSync(authPath, ac);
