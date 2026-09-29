const fs = require('fs');
const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace User Placeholder
content = content.replace(
  `import AccessProvisioning from './pages/admin/AccessProvisioning';\nimport AmbulanceTracking from './pages/admin/AmbulanceTracking';`,
  `import AccessProvisioning from './pages/admin/AccessProvisioning';\nimport AmbulanceTracking from './pages/admin/AmbulanceTracking';\nimport UserDashboard from './pages/user/UserDashboard';`
);

content = content.replace(
  `<Route path="/user/dashboard" element={<Placeholder title="User (Customer) Dashboard" />} />`,
  `<Route path="/user/dashboard" element={<UserDashboard />} />`
);

fs.writeFileSync(filePath, content);
console.log("Patched App.tsx route");
