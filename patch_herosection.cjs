const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetTabs = `const tabs = [
    { id: 'admin', label: 'Admin Portal' },
    { id: 'user', label: 'User Portal' },
    { id: 'family', label: 'Family/Guardian' },
    { id: 'hospital', label: 'Hospital/Ambulance' }
  ];`;

const fixedTabs = `const tabs = [
    { id: 'admin', label: 'Admin Portal' },
    { id: 'family', label: 'Family/Guardian' },
    { id: 'hospital', label: 'Hospital/Ambulance' }
  ];`;

content = content.replace(targetTabs, fixedTabs);

const targetDefaultTab = `const [activeTab, setActiveTab] = useState('user');`;
const fixedDefaultTab = `const [activeTab, setActiveTab] = useState('admin');`;
content = content.replace(targetDefaultTab, fixedDefaultTab);

fs.writeFileSync(filePath, content);
console.log("Patched HeroSection tabs");
