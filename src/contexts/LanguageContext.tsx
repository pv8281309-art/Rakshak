import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.dashboard': 'Home',
    'nav.report': 'Report Accident',
    'nav.tracking': 'Live Tracking',
    'nav.alerts': 'My Alerts',
    'nav.contacts': 'Emergency Contacts',
    'nav.tutorials': 'Tutorials',
    'nav.hospitals': 'Nearby Hospitals',
    'nav.settings': 'Settings',

    
    'settings.title': 'Settings',
    'settings.desc': 'Configure your app preferences.',
    'settings.push': 'Push Notifications',
    'settings.pushDesc': 'Receive alerts for emergency updates.',
    'settings.loc': 'Location Services',
    'settings.locDesc': 'Allow automatic location capture during SOS.',
    'settings.lang': 'Language',
    'settings.langDesc': 'Choose your preferred language.',
    'settings.dark': 'Dark Mode',
    'settings.darkDesc': 'Toggle dark theme.',
    'settings.logout': 'Sign Out',
    'contacts.title': 'Emergency Contacts',
    'dashboard.welcome': 'Welcome',
    'dashboard.status': 'System Active',
    'map.route': 'Route',
    'map.call': 'Call'
  },
  hi: {
    'nav.dashboard': 'होम',
    'nav.report': 'दुर्घटना रिपोर्ट',
    'nav.tracking': 'लाइव ट्रैकिंग',
    'nav.alerts': 'मेरे अलर्ट',
    'nav.contacts': 'आपातकालीन संपर्क',
    'nav.tutorials': 'ट्यूटोरियल',
    'nav.hospitals': 'आसपास के अस्पताल',
    'nav.settings': 'सेटिंग्स',

    'settings.push': 'पुश सूचनाएँ',
    'settings.pushDesc': 'आपातकालीन अपडेट के लिए अलर्ट प्राप्त करें।',
    'settings.loc': 'स्थान सेवाएँ',
    'settings.locDesc': 'SOS के दौरान स्वचालित स्थान कैप्चर की अनुमति दें।',
    'settings.lang': 'भाषा',
    'settings.langDesc': 'अपनी पसंदीदा भाषा चुनें।',
    'settings.dark': 'डार्क मोड',
    'settings.darkDesc': 'डार्क थीम टॉगल करें।',
    'settings.logout': 'साइन आउट',
    'contacts.title': 'आपातकालीन संपर्क',
    'dashboard.welcome': 'स्वागत है',
    'dashboard.status': 'सिस्टम सक्रिय',
    'map.route': 'रास्ता',
    'map.call': 'कॉल'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLang] = useState<Language>(() => {
    return (localStorage.getItem('rakshak_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem('rakshak_language', lang);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || (translations['en'] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
