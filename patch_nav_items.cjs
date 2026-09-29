const fs = require('fs');
let content = fs.readFileSync('src/layouts/UserLayout.tsx', 'utf8');

// I will just replace the entire navItems array block
const regex = /const navItems = \[[\s\S]*?\];/;
const newNavItems = `const navItems = [
    { name: 'nav.dashboard', path: '/user/dashboard', icon: Home },
    { name: 'nav.report', path: '/user/report', icon: AlertTriangle, highlight: true },
    { name: 'nav.tracking', path: '/user/tracking', icon: Navigation },
    { name: 'nav.alerts', path: '/user/alerts', icon: Bell },
    { name: 'nav.contacts', path: '/user/contacts', icon: Phone },
    { name: 'nav.tutorials', path: '/user/tutorials', icon: BookOpen },
    { name: 'nav.hospitals', path: '/user/hospitals', icon: PlusSquare },
    { name: 'nav.settings', path: '/user/settings', icon: Settings },
  ];`;

content = content.replace(regex, newNavItems);
fs.writeFileSync('src/layouts/UserLayout.tsx', content);
