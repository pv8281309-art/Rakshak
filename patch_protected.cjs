const fs = require('fs');
const filePath = 'src/components/ProtectedRoute.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `  if (role && !allowedRoles.includes(role)) {`;

const fixed = `  // Prevent access to protected routes if password change is required
  if (clientSession?.requiresPasswordChange && location.pathname !== '/user/change-password') {
    return <Navigate to="/user/change-password" replace />;
  }

  if (role && !allowedRoles.includes(role)) {`;

content = content.replace(target, fixed);
fs.writeFileSync(filePath, content);
console.log("Patched ProtectedRoute");
