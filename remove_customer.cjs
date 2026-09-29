const fs = require('fs');

// 1. HeroSection.tsx
let heroPath = 'src/components/landing/HeroSection.tsx';
let hero = fs.readFileSync(heroPath, 'utf8');

// Remove toggle block
hero = hero.replace(/\{\/\* Login Type Toggle \*\/\}.*?(<div className="relative w-full min-h-\[400px\]">).*?<\/div>/s, '$1\n              <AdminLoginCard />\n            </div>');
// Remove loginType state
hero = hero.replace(/const \[loginType, setLoginType\] = useState\s*<.*?>\('customer'\);\s*/g, '');
// Remove CustomerLoginCard import
hero = hero.replace(/import \{ CustomerLoginCard \} from '\.\/CustomerLoginCard';\n/g, '');

fs.writeFileSync(heroPath, hero);


// 2. App.tsx
let appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(/import \{ CustomerLayout \} from '\.\/layouts\/CustomerLayout';\n/g, '');
app = app.replace(/\/\/ Customer Pages\nimport CustomerDashboard from '\.\/pages\/CustomerDashboard';\nimport CustomerResetPassword from '\.\/pages\/CustomerResetPassword';\n/g, '');

// Remove the Route blocks
app = app.replace(/\{\/\* Customer Reset Password[\s\S]*?<\/Route>/g, '');
app = app.replace(/\{\/\* Customer Routes[\s\S]*?<\/Route>/g, '');

// Clean up Admin Routes allowedTypes
app = app.replace(/<Route element=\{<ProtectedRoute allowedTypes=\{\['admin'\]\} \/>\}>/g, '<Route element={<ProtectedRoute />}>');
fs.writeFileSync(appPath, app);

console.log("Cleaned HeroSection and App.tsx");
