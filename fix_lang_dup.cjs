const fs = require('fs');
let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

content = content.replace(/      'nav\.dashboard': 'डैशबोर्ड',\n      'nav\.hospitals': 'आसपास के अस्पताल',\n      'nav\.contacts': 'आपातकालीन संपर्क',\n      'nav\.settings': 'सेटिंग्स',\n/g, "");

fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
