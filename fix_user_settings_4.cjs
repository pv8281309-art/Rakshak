const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserSettings.tsx', 'utf8');

content = content.replace("<{t('settings.title')} className=\"text-blue-500\" />", "<Settings className=\"text-blue-500\" />");

fs.writeFileSync('src/pages/user/UserSettings.tsx', content);
