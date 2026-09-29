const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const oldCode = `      const secAuth = getSecondaryAuth();
      let uid = \`mock_uid_\${Date.now()}\`;

      // Fallback to fake email if none provided to satisfy Firebase Auth
      const authEmail = (formData.email || "").trim() || \`\${formData.customerId.toLowerCase()}@rakshak.internal\`;

      if (secAuth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(secAuth, authEmail, tempPass);
          uid = userCredential.user.uid;
        } catch (authErr: any) { 
          console.warn("Auth creation failed:", authErr.message);
          if (authErr.code === 'auth/invalid-email') {
            alert("Firebase Authentication Error: The email address is badly formatted. Please provide a valid email address.");
          } else {
            alert("Firebase Authentication Error: Please go to your Firebase Console (Authentication -> Sign-in method) and enable 'Email/Password' provider.");
          }
          setIsProvisioning(false);
          return;
        }
      }`;

const newCode = `      const secAuth = getSecondaryAuth();
      
      if (!secAuth) {
        alert("Firebase is not fully connected. Please check your environment variables.");
        setIsProvisioning(false);
        return;
      }

      let uid = '';
      const authEmail = (formData.email || "").trim() || \`\${formData.customerId.toLowerCase()}@rakshak.internal\`;

      try {
        const userCredential = await createUserWithEmailAndPassword(secAuth, authEmail, tempPass);
        uid = userCredential.user.uid;
      } catch (authErr: any) { 
        console.warn("Auth creation failed:", authErr.message);
        if (authErr.code === 'auth/invalid-email') {
          alert("Firebase Auth Error: Badly formatted email. Please enter a valid email address.");
        } else if (authErr.code === 'auth/email-already-in-use') {
          alert("Firebase Auth Error: This email address is already in use by another user.");
        } else if (authErr.code === 'auth/operation-not-allowed') {
          alert("Firebase Auth Error: 'Email/Password' is disabled. Please go to Firebase Console -> Authentication -> Sign-in method and enable Email/Password.");
        } else {
          alert("Firebase Auth Error: " + authErr.message);
        }
        setIsProvisioning(false);
        return;
      }`;

c = c.replace(oldCode, newCode);
fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
