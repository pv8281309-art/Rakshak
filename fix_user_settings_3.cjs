const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserSettings.tsx', 'utf8');

content = content.replace("const { language, set{t('settings.lang')}, t } = use{t('settings.lang')}();", "const { language, setLanguage, t } = useLanguage();");
content = content.replace("set{t('settings.lang')}(e.target.value", "setLanguage(e.target.value");

fs.writeFileSync('src/pages/user/UserSettings.tsx', content);
