const fs = require('fs');

// 1. ProtectedRoute.tsx
let prPath = 'src/components/ProtectedRoute.tsx';
let pr = fs.readFileSync(prPath, 'utf8');

pr = pr.replace(/interface ProtectedRouteProps \{\n  allowedTypes\?: \('admin' \| 'customer'\)\[\];\n\}\n\n/g, '');
pr = pr.replace(/export const ProtectedRoute: React\.FC<ProtectedRouteProps> = \(\{ allowedTypes = \['admin'\] \}\) => \{/g, 'export const ProtectedRoute = () => {');
pr = pr.replace(/const \{ currentUser, adminUser, customerUser, loading, isMock \} = useAuth\(\);/g, 'const { currentUser, adminUser, loading, isMock } = useAuth();');

pr = pr.replace(/const isCustomer = !!customerUser;\n/g, '');
pr = pr.replace(/const isAdmin = adminUser\?\.role === 'admin';\n/g, '');

// Clean up all the allowedTypes blocks and replace with simple admin check
pr = pr.replace(/if \(allowedTypes\.includes\('admin'\) && allowedTypes\.includes\('customer'\)\) \{[\s\S]*?return <Outlet \/>;\n  \}/, '');
pr = pr.replace(/if \(allowedTypes\.includes\('customer'\) && !isCustomer\) \{[\s\S]*?return <Navigate to="\/" replace \/>;\n  \}/, '');
pr = pr.replace(/\/\/ Handle first-time password reset for customers[\s\S]*?return <Navigate to="\/customer\/reset-password" replace \/>;\n  \}/, '');

pr = pr.replace(/if \(allowedTypes\.includes\('admin'\) && !isAdmin\) \{[\s\S]*?if \(isCustomer\) return <Navigate to="\/customer\/dashboard" replace \/>;/g, `const isAdmin = adminUser?.role === 'admin';\n  if (!isAdmin) {`);

fs.writeFileSync(prPath, pr);


// 2. AuthContext.tsx
let acPath = 'src/contexts/AuthContext.tsx';
let ac = fs.readFileSync(acPath, 'utf8');

ac = ac.replace(/import \{ User, Role, Customer \} from '\.\.\/types';/g, "import { User, Role } from '../types';");
ac = ac.replace(/customerUser: Customer \| null;\n/g, '');
ac = ac.replace(/customerUser: null,\n/g, '');
ac = ac.replace(/const \[customerUser, setCustomerUser\] = useState<Customer \| null>\(null\);\n/g, '');
ac = ac.replace(/setCustomerUser\(null\);\n/g, '');
ac = ac.replace(/setCustomerUser\(null\);/g, '');

ac = ac.replace(/\/\/ Check customers collection[\s\S]*?\} else \{\n              setAdminUser\(null\);\n              \n            \}/g, 'setAdminUser(null);');

ac = ac.replace(/value=\{\{ currentUser, adminUser, customerUser, loading, signOut, isFirebaseConfigured, isMock \}\}/g, 'value={{ currentUser, adminUser, loading, signOut, isFirebaseConfigured, isMock }}');

fs.writeFileSync(acPath, ac);

console.log("Cleaned AuthContext and ProtectedRoute");
