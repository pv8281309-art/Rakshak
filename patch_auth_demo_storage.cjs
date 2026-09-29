const fs = require('fs');
const filePath = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetLogic = `    // DEMO OVERRIDE
    if (userId.toLowerCase() === 'demo' && password === 'demo') {
        validLogin = true;
    }`;

const fixedLogic = `    // DEMO OVERRIDE
    if (userId.toLowerCase() === 'demo' && password === 'demo') {
        validLogin = true;
        // Inject demo user into local storage so dashboards work seamlessly
        const localCustomers = JSON.parse(localStorage.getItem('rakshak_customers') || '[]');
        if (!localCustomers.find((c: any) => c.customerId === 'demo')) {
          localCustomers.push({
            id: 'demo-doc-id',
            customerId: 'demo',
            password: 'demo',
            name: 'Demo User',
            phone: '+91 9876543210',
            status: 'active',
            vehicle: { regNo: 'DL-1C-AA-1234' },
            emergencyContacts: [{ name: 'Emergency Contact', mobile: '+91 9999999999', relation: 'Family' }]
          });
          localStorage.setItem('rakshak_customers', JSON.stringify(localCustomers));
        }
    }`;

content = content.replace(targetLogic, fixedLogic);

fs.writeFileSync(filePath, content);
console.log("Patched AuthContext with Demo user injection");
