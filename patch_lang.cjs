const fs = require('fs');
let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

const enExtras = `
    'nav.dashboard': 'Home',
    'nav.report': 'Report Accident',
    'nav.tracking': 'Live Tracking',
    'nav.alerts': 'My Alerts',
    'nav.contacts': 'Emergency Contacts',
    'nav.tutorials': 'Tutorials',
    'nav.hospitals': 'Nearby Hospitals',
    'nav.settings': 'Settings',
`;

const hiExtras = `
    'nav.dashboard': 'होम',
    'nav.report': 'दुर्घटना रिपोर्ट',
    'nav.tracking': 'लाइव ट्रैकिंग',
    'nav.alerts': 'मेरे अलर्ट',
    'nav.contacts': 'आपातकालीन संपर्क',
    'nav.tutorials': 'ट्यूटोरियल',
    'nav.hospitals': 'आसपास के अस्पताल',
    'nav.settings': 'सेटिंग्स',
`;

content = content.replace(/'nav\.dashboard': 'Dashboard',[\s\S]*?'nav\.settings': 'Settings',/g, "");

content = content.replace("en: {", "en: {" + enExtras);
content = content.replace("hi: {", "hi: {" + hiExtras);

fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
