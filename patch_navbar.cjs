const fs = require('fs');
const filePath = 'src/components/landing/LandingNavbar.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-6">
            
            <button 
              onClick={toggleTheme}`;

const fixedStr = `          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/user/login" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-colors shadow-lg shadow-blue-500/20">
              User Portal
            </Link>
            <button 
              onClick={toggleTheme}`;

if(content.includes(targetStr)) {
  content = content.replace(targetStr, fixedStr);
  fs.writeFileSync(filePath, content);
  console.log("Patched LandingNavbar");
} else {
  console.log("Could not find target in LandingNavbar");
}
