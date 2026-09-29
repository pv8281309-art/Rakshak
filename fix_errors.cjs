const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/AccessProvisioning.tsx', 'utf8');

// Fix Firestore fetch logging
c = c.replace(
  /} catch \(dbErr\) {\s*console\.error\('Firestore fetch failed:', dbErr\);/g,
  `} catch (dbErr: any) {
          console.warn('Firestore fetch failed (DB may not be created yet):', dbErr.message);`
);

// Fix Auth error handling
const authTarget = `        } catch (authErr: any) { 
          console.error("Auth creation failed:", authErr);
          if (authErr.code === 'auth/invalid-email') {
            alert("Firebase Authentication Error: The email address is badly formatted. Please provide a valid email address.");
          } else {
            alert("Firebase Authentication Error: Please go to your Firebase Console (Authentication -> Sign-in method) and enable 'Email/Password' provider.");
          }
          throw authErr;
        }`;

const authReplace = `        } catch (authErr: any) { 
          console.warn("Auth creation failed:", authErr.message);
          if (authErr.code === 'auth/invalid-email') {
            alert("Firebase Authentication Error: The email address is badly formatted. Please provide a valid email address.");
          } else {
            alert("Firebase Authentication Error: Please go to your Firebase Console (Authentication -> Sign-in method) and enable 'Email/Password' provider.");
          }
          setIsProvisioning(false);
          return;
        }`;
c = c.replace(authTarget, authReplace);

// Fix Firestore save error handling
const dbTarget = `        } catch (dbErr: any) { 
          console.error("Firestore Error:", dbErr); 
          alert("Firestore Database Error: Please make sure you have clicked 'Create Database' in your Firebase Console under Firestore Database.");
          throw dbErr;
        }`;

const dbReplace = `        } catch (dbErr: any) { 
          console.warn("Firestore Error:", dbErr.message); 
          alert("Firestore Database Error: Please make sure you have clicked 'Create Database' in your Firebase Console under Firestore Database.");
          setIsProvisioning(false);
          return;
        }`;
c = c.replace(dbTarget, dbReplace);

// Fix Provisioning catch
const provTarget = `    } catch (err) {
      console.error("Provisioning failed:", err);
      alert("Provisioning failed. Check console for details.");
    }`;

const provReplace = `    } catch (err: any) {
      console.warn("Provisioning failed:", err.message);
      alert("Provisioning failed. Check console for details.");
    }`;
c = c.replace(provTarget, provReplace);

fs.writeFileSync('src/pages/admin/AccessProvisioning.tsx', c);
