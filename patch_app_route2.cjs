const fs = require('fs');
const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `import UserDashboard from './pages/user/UserDashboard';`,
  `import UserDashboard from './pages/user/UserDashboard';\nimport FamilyDashboard from './pages/family/FamilyDashboard';\nimport HospitalDashboard from './pages/hospital/HospitalDashboard';`
);

content = content.replace(
  `<Route path="/hospital/dashboard" element={<Placeholder title="Hospital Dashboard" />} />`,
  `<Route path="/hospital/dashboard" element={<HospitalDashboard />} />`
);

content = content.replace(
  `<Route path="/family/dashboard" element={<Placeholder title="Family Dashboard" />} />`,
  `<Route path="/family/dashboard" element={<FamilyDashboard />} />`
);

fs.writeFileSync(filePath, content);
console.log("Patched App.tsx route 2");
