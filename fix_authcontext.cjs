const fs = require('fs');
let authPath = 'src/contexts/AuthContext.tsx';
let ac = fs.readFileSync(authPath, 'utf8');

ac = ac.replace(/\/\/ Check customers collection[\s\S]*?\} else \{/g, '');
ac = ac.replace(/const querySnapshot = await getDocs\(q\);\s*if \(\!querySnapshot.empty\) \{[\s\S]*?\} else \{/g, '');
// Specifically looking at what's in the file:
ac = ac.replace(/const data = customerDoc\.data\(\) as Customer;\s*setCustomerUser\(\{ \.\.\.data, id: customerDoc\.id \}\);\s*setAdminUser\(null\);/g, 'setAdminUser(null);');
ac = ac.replace(/const customerDoc = querySnapshot\.docs\[0\];/g, '');
ac = ac.replace(/const data = customerDoc\.data\(\) as Customer;/g, '');
ac = ac.replace(/setCustomerUser\(\{ \.\.\.data, id: customerDoc\.id \}\);/g, '');

// A cleaner regex for the whole else block:
const targetBlock = `          } else {
            // Check customers collection
            const q = query(collection(db, 'customers'), where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const customerDoc = querySnapshot.docs[0];
              const data = customerDoc.data() as Customer;
              setCustomerUser({ ...data, id: customerDoc.id });
              setAdminUser(null);
            } else {
              setAdminUser(null);                          
            }
          }`;

const replacementBlock = `          } else {
            setAdminUser(null);
          }`;

ac = ac.replace(targetBlock, replacementBlock);
fs.writeFileSync(authPath, ac);

