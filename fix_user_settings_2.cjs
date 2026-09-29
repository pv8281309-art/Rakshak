const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserSettings.tsx', 'utf8');

content = content.replace("export default function User{t('settings.title')}() {", "export default function UserSettings() {");

fs.writeFileSync('src/pages/user/UserSettings.tsx', content);
