const fs = require('fs');
let nav = fs.readFileSync('src/components/landing/LandingNavbar.tsx', 'utf8');

const target = `{navLinks.map((link) => (`;
const replacement = `<Link 
                  to="/login"
                  className={cn(
                    "text-left text-lg font-bold py-2 border-b border-slate-700/30 uppercase tracking-wider",
                    isDark ? "text-rakshak-orange" : "text-rakshak-orange"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login Portal
                </Link>
                {navLinks.map((link) => (`;
nav = nav.replace(target, replacement);
fs.writeFileSync('src/components/landing/LandingNavbar.tsx', nav);
