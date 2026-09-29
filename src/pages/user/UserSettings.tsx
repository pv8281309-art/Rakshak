import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, Shield, Bell, MapPin, Globe, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function UserSettings() {
  const { signOut } = useAuth();
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-blue-500" /> {t('settings.title')}
        </h1>
        <p className="text-slate-400 mt-1">{t('settings.desc')}</p>
      </div>

      <div className="bg-[#020617]/50 rounded-2xl border border-slate-800 p-6 divide-y divide-slate-800">
        
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">{t('settings.push')}</h3>
              <p className="text-sm text-slate-400">{t('settings.pushDesc')}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={notifications} onChange={(e) => handlePushToggle(e.target.checked)} />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">{t('settings.loc')}</h3>
              <p className="text-sm text-slate-400">{t('settings.locDesc')}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={locationSharing} onChange={(e) => handleLocToggle(e.target.checked)} />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">{t('settings.lang')}</h3>
              <p className="text-sm text-slate-400">Select app language.</p>
            </div>
          </div>
          <select className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none" value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}>
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
        </div>

        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-slate-400">
              <Moon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">{t('settings.dark')}</h3>
              <p className="text-sm text-slate-400">{t('settings.darkDesc')}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isDark} onChange={toggleTheme} />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

      </div>

      <div className="mt-8 text-center">
        <button onClick={signOut} className="text-red-400 hover:text-red-300 font-bold text-sm transition-colors">
          {t('settings.logout')}
        </button>
      </div>
    </div>
  );
}
