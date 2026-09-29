const fs = require('fs');
let content = fs.readFileSync('src/layouts/UserLayout.tsx', 'utf8');

if (!content.includes('useLanguage')) {
  content = content.replace("import { useAuth } from '../contexts/AuthContext';", "import { useAuth } from '../contexts/AuthContext';\nimport { useLanguage } from '../contexts/LanguageContext';");
  
  content = content.replace("const { clientSession, signOut } = useAuth();", "const { clientSession, signOut } = useAuth();\n  const { t } = useLanguage();");
  
  // Update nav mapping
  content = content.replace(/{item.name}/g, "{t(item.name)}");
  
  // Replace the item names in the array
  content = content.replace(/name: 'Dashboard'/g, "name: 'nav.dashboard'");
  content = content.replace(/name: 'Nearby Hospitals'/g, "name: 'nav.hospitals'");
  content = content.replace(/name: 'Emergency Contacts'/g, "name: 'nav.contacts'");
  content = content.replace(/name: 'Settings'/g, "name: 'nav.settings'");
  
  fs.writeFileSync('src/layouts/UserLayout.tsx', content);
}
