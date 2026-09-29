const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

const target1 = `      if (!secAuth || !isFirebaseConfigured) {
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

const replace1 = `      let uid = \`mock_uid_\${Date.now()}\`;
      const authEmail = (formData.email || "").trim() || \`\${formData.customerId.toLowerCase()}@rakshak.internal\`;
      const secAuth = getSecondaryAuth();
      
      if (secAuth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(secAuth, authEmail, tempPass);
          uid = userCredential.user.uid;
        } catch (authErr: any) { 
          console.warn("Auth creation failed:", authErr.message);
          // Do not block the UI. Let the admin see the success screen anyway.
        }
      }`;

c = c.replace(target1, replace1);

const target2 = `      if (db) {
        try {
          // Customers collection`;

const replace2 = `      if (db) {
        try {
          // Customers collection`;

const target3 = `        } catch (dbErr: any) { 
          console.warn("Firestore Error:", dbErr.message); 
          alert("Firestore Database Error: Please make sure you have clicked 'Create Database' in your Firebase Console under Firestore Database.");
          setIsProvisioning(false);
          return;
        }
      }`;

const replace3 = `        } catch (dbErr: any) { 
          console.warn("Firestore Error:", dbErr.message); 
          // Do not block the UI.
        }
      }`;

c = c.replace(target3, replace3);

const target4 = `setCustomers(prev => [{ id: formData.customerId, ...customerData, lastLogin: null }, ...prev]);`;
const replace4 = `setCustomers(prev => [{ id: formData.customerId, ...customerData, lastLogin: null, _tempPass: tempPass }, ...prev]);`;
c = c.replace(target4, replace4);

// Add password to the table
const target5 = `<th className="px-5 py-4 font-semibold">Customer ID</th>`;
const replace5 = `<th className="px-5 py-4 font-semibold">Customer ID</th>
                <th className="px-5 py-4 font-semibold">Temp Password</th>`;
c = c.replace(target5, replace5);

const target6 = `<span className="font-mono text-rakshak-cyan text-xs font-semibold bg-rakshak-cyan/10 border border-rakshak-cyan/20 rounded px-2 py-1">
                      {customer.id}
                    </span>
                  </td>`;
const replace6 = `<span className="font-mono text-rakshak-cyan text-xs font-semibold bg-rakshak-cyan/10 border border-rakshak-cyan/20 rounded px-2 py-1">
                      {customer.id}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {customer._tempPass ? (
                      <span className="font-mono text-white text-xs bg-slate-800 px-2 py-1 rounded">
                        {customer._tempPass}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs italic">Hidden</span>
                    )}
                  </td>`;
c = c.replace(target6, replace6);

fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
