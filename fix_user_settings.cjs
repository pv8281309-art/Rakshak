const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserSettings.tsx', 'utf8');

// Fix the bad replacements
content = content.replace("import { {t('settings.title')}", "import { Settings");
content = content.replace("import { use{t('settings.lang')} } from '../../contexts/{t('settings.lang')}Context';", "import { useLanguage } from '../../contexts/LanguageContext';");

fs.writeFileSync('src/pages/user/UserSettings.tsx', content);
