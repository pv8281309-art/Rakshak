const fs = require('fs');

// 1. Update LandingNavbar.tsx
let nav = fs.readFileSync('src/components/landing/LandingNavbar.tsx', 'utf8');
const navTarget = `<div className="hidden lg:flex items-center gap-6">
            <button 
              onClick={toggleTheme}`;
const navReplacement = `<div className="hidden lg:flex items-center gap-6">
            <Link 
              to="/login"
              className={cn(
                "px-5 py-2 rounded-lg font-bold text-sm tracking-wider uppercase transition-all shadow-lg",
                isDark 
                  ? "bg-rakshak-orange text-white hover:bg-orange-600 shadow-orange-500/20" 
                  : "bg-slate-900 text-white hover:bg-slate-800"
              )}
            >
              Login Portal
            </Link>
            <button 
              onClick={toggleTheme}`;
nav = nav.replace(navTarget, navReplacement);
fs.writeFileSync('src/components/landing/LandingNavbar.tsx', nav);

// 2. Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
const importTarget = `import LandingPage from './pages/LandingPage';`;
const importReplacement = `import LandingPage from './pages/LandingPage';\nimport LoginPage from './pages/LoginPage';`;
app = app.replace(importTarget, importReplacement);

const routeTarget = `<Route path="/" element={<LandingPage />} />`;
const routeReplacement = `<Route path="/" element={<LandingPage />} />\n              <Route path="/login" element={<LoginPage />} />`;
app = app.replace(routeTarget, routeReplacement);
fs.writeFileSync('src/App.tsx', app);
