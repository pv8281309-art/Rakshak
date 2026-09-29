const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserSettings.tsx', 'utf8');

content = content.replace("import { useTheme } from '../../contexts/ThemeContext';", "import { useTheme } from '../../contexts/ThemeContext';\nimport { useLanguage } from '../../contexts/LanguageContext';");

const funcStart = "export default function UserSettings() {";
const setup = `  const { signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const [notifications, setNotifications] = useState(() => localStorage.getItem('rakshak_push') !== 'false');
  const [locationSharing, setLocationSharing] = useState(() => localStorage.getItem('rakshak_loc') !== 'false');

  const handlePushToggle = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem('rakshak_push', String(checked));
  };

  const handleLocToggle = (checked: boolean) => {
    setLocationSharing(checked);
    localStorage.setItem('rakshak_loc', String(checked));
  };
`;
content = content.replace(/export default function UserSettings\(\) \{[\s\S]*?return \(/, `export default function UserSettings() {\n${setup}\n  return (`);

content = content.replace(/checked=\{notifications\} onChange=\{\(e\) => setNotifications\(e\.target\.checked\)\}/g, "checked={notifications} onChange={(e) => handlePushToggle(e.target.checked)}");
content = content.replace(/checked=\{locationSharing\} onChange=\{\(e\) => setLocationSharing\(e\.target\.checked\)\}/g, "checked={locationSharing} onChange={(e) => handleLocToggle(e.target.checked)}");
content = content.replace(/checked=\{isDark\} onChange=\{\(\) => toggleTheme\(\)\}/g, "checked={isDark} onChange={() => toggleTheme()}");

content = content.replace(/<select[\s\S]*?<\/select>/, `<select className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none" value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}>
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>`);

content = content.replace(/Settings/g, "{t('settings.title')}");
content = content.replace(/Configure your app preferences\./g, "{t('settings.desc')}");
content = content.replace(/Push Notifications/g, "{t('settings.push')}");
content = content.replace(/Receive alerts for emergency updates\./g, "{t('settings.pushDesc')}");
content = content.replace(/Location Services/g, "{t('settings.loc')}");
content = content.replace(/Allow automatic location capture during SOS\./g, "{t('settings.locDesc')}");
content = content.replace(/Language/g, "{t('settings.lang')}");
content = content.replace(/Choose your preferred language\./g, "{t('settings.langDesc')}");
content = content.replace(/Dark Mode/g, "{t('settings.dark')}");
content = content.replace(/Toggle dark theme\./g, "{t('settings.darkDesc')}");
content = content.replace(/Sign Out of User Portal/g, "{t('settings.logout')}");

fs.writeFileSync('src/pages/user/UserSettings.tsx', content);
