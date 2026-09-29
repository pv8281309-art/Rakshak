const fs = require('fs');
const filePath = 'src/pages/user/UserDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetFallback = `    const loadLocal = () => {
      const localData = JSON.parse(localStorage.getItem('rakshak_customers') || '[]');
      const user = localData.find((c: any) => c.customerId === clientSession.id);
      if (user) setUserData(user);
    };`;

const fixedFallback = `    const loadLocal = () => {
      if (clientSession.id.toLowerCase() === 'demo') {
        setUserData({
          id: 'demo-doc-id',
          customerId: 'demo',
          name: 'Demo User',
          phone: '+91 9876543210',
          status: 'active',
          vehicle: { regNo: 'DL-1C-AA-1234' },
          emergencyContacts: [{ name: 'Emergency Contact', mobile: '+91 9999999999', relation: 'Family' }]
        });
        return;
      }
      const localData = JSON.parse(localStorage.getItem('rakshak_customers') || '[]');
      const user = localData.find((c: any) => c.customerId === clientSession.id);
      if (user) setUserData(user);
    };`;

content = content.replace(targetFallback, fixedFallback);

fs.writeFileSync(filePath, content);
console.log("Patched UserDashboard with Demo user data");
