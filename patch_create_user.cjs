const fs = require('fs');
const filePath = 'src/pages/admin/AccessProvisioning.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      if (isFirebaseConfigured && db) {
        try {
          // Remove createdAt before setting to local state if serverTimestamp is used, but we need it for Firestore
          await setDoc(doc(db, 'customers', formData.customerId), customerData);
        } catch (fbError) {
          console.warn("Firebase provisioning failed, continuing with local storage:", fbError);
        }
      }`;

const fixed = `      try {
        const response = await fetch('/api/auth/createUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: formData.customerId,
            password: pass,
            userData: { ...customerData },
            adminId: 'ADMIN' // In a real app, this would be the actual admin ID
          })
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to create user on backend");
        }
      } catch (backendError) {
        console.warn("Backend provisioning failed:", backendError);
        throw backendError;
      }`;

content = content.replace(target, fixed);

// Remove the local storage storing of passwords
const targetMock = `      // Auto-save auth mock for landing page login
      const mockAuth = JSON.parse(localStorage.getItem('rakshak_mock_auth') || '{}');
      mockAuth[formData.customerId] = {
        password: pass,
        role: formData.role.toLowerCase()
      };
      localStorage.setItem('rakshak_mock_auth', JSON.stringify(mockAuth));`;

content = content.replace(targetMock, '');

fs.writeFileSync(filePath, content);
console.log("Patched handleGenerateAccess");
