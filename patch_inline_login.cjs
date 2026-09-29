const fs = require('fs');

// 1. Remove Top Navbar Button
let nav = fs.readFileSync('src/components/landing/LandingNavbar.tsx', 'utf8');

// Replace standard prop structure back to simple
nav = nav.replace(
  `export const LandingNavbar = ({ onLoginClick }: { onLoginClick?: () => void }) => {`,
  `export const LandingNavbar = () => {`
);

// Remove the Desktop button
const deskBtnTarget = `<button 
              onClick={onLoginClick}
              className={cn(
                "px-5 py-2 rounded-lg font-bold text-sm tracking-wider uppercase transition-all shadow-lg",
                isDark 
                  ? "bg-rakshak-orange text-white hover:bg-orange-600 shadow-orange-500/20" 
                  : "bg-slate-900 text-white hover:bg-slate-800"
              )}
            >
              Login Portal
            </button>`;
nav = nav.replace(deskBtnTarget, '');

// Remove the Mobile button
const mobBtnTarget = `<button 
                  onClick={() => { setMobileMenuOpen(false); onLoginClick?.(); }}
                  className={cn(
                    "text-left text-lg font-bold py-2 border-b border-slate-700/30 uppercase tracking-wider",
                    isDark ? "text-rakshak-orange" : "text-rakshak-orange"
                  )}
                >
                  Login Portal
                </button>`;
nav = nav.replace(mobBtnTarget, '');
fs.writeFileSync('src/components/landing/LandingNavbar.tsx', nav);

// 2. Remove Modal From LandingPage.tsx
let landing = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');
landing = landing.replace(`import { LoginModal } from '../components/landing/LoginModal';\n`, '');
landing = landing.replace(`import { useState } from 'react';\n`, '');
landing = landing.replace(`import { AnimatePresence } from 'framer-motion';\n`, '');

landing = landing.replace(`  const { isDark } = useTheme();
  const [loginModalOpen, setLoginModalOpen] = useState(false);`, `  const { isDark } = useTheme();`);

landing = landing.replace(`<LandingNavbar onLoginClick={() => setLoginModalOpen(true)} />`, `<LandingNavbar />`);

landing = landing.replace(`<LandingFooter />
      <AnimatePresence>
        {loginModalOpen && <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />}
      </AnimatePresence>`, `<LandingFooter />`);
fs.writeFileSync('src/pages/LandingPage.tsx', landing);


// 3. Inject the Multi-role Login Form into the HeroSection component directly
let hero = fs.readFileSync('src/components/landing/HeroSection.tsx', 'utf8');

// Add imports
const heroImportTarget = `import { ArrowRight, Shield, AlertTriangle, Clock } from 'lucide-react';`;
const heroImportReplacement = `import { ArrowRight, Shield, AlertTriangle, Clock, Mail, Fingerprint, Lock, Eye, EyeOff, Car, User, Users, PlusSquare } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';`;
hero = hero.replace(heroImportTarget, heroImportReplacement);

// Update Component signature to have state
const heroCompTarget = `export const HeroSection = () => {`;
const heroCompReplacement = `export const HeroSection = () => {
  const navigate = useNavigate();
  const { isMock } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'admin' | 'user' | 'family' | 'hospital'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [carNumber, setCarNumber] = useState('');

  const tabs = [
    { id: 'admin', label: 'Admin' },
    { id: 'user', label: 'User' },
    { id: 'family', label: 'Family' },
    { id: 'hospital', label: 'Hospital' },
  ] as const;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'admin') {
        if (isFirebaseConfigured && auth) {
          try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin/dashboard');
          } catch (err: any) {
            setError(err.message || 'Invalid admin credentials');
          }
        } else {
          if (email === 'admin@rakshak.in' && password === 'admin123') {
            if (typeof window !== 'undefined') (window as any).enableMockAdmin?.();
            navigate('/admin/dashboard');
          } else {
            setError('Invalid credentials. Hint: admin@rakshak.in / admin123');
          }
        }
      } 
      else if (activeTab === 'user') {
        const mockAuth = JSON.parse(localStorage.getItem('rakshak_mock_auth') || '{}');
        const userRec = mockAuth[userId];
        if (userRec && userRec.password === password) {
          localStorage.setItem('rakshak_user_session', JSON.stringify({ role: 'user', id: userId }));
          navigate('/user/dashboard');
        } else {
          setError('Invalid User ID or Password');
        }
      }
      else if (activeTab === 'family') {
         if (userId && carNumber && password) {
            localStorage.setItem('rakshak_user_session', JSON.stringify({ role: 'family', id: userId, car: carNumber }));
            navigate('/family/dashboard');
         } else {
            setError('Please provide Car Number, User ID, and Password.');
         }
      }
      else if (activeTab === 'hospital') {
        if (userId === 'HOSP-001' && password === 'admin123') {
          localStorage.setItem('rakshak_user_session', JSON.stringify({ role: 'hospital', id: userId }));
          navigate('/hospital/dashboard');
        } else {
          setError('Invalid Hospital ID or Password');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
`;
hero = hero.replace(heroCompTarget, heroCompReplacement);

// Find the right-side container (where the old admin login is) and replace it
// It currently looks like this:
/*
<div className="hidden lg:block w-[440px] shrink-0">
  <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
  ...
</div>
*/
const loginPanelRegex = /<div className="hidden lg:block w-\[440px\] shrink-0">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const newLoginPanel = `<div className="hidden lg:block w-[440px] shrink-0">
            <div className="bg-gradient-to-b from-[#1e2330]/90 to-[#0a0d14]/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 p-8 pt-10">
              {/* Top Logo & Title */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-black rounded-lg border border-slate-700 flex items-center justify-center p-1 shadow-lg">
                   <img src="/logo1.png" alt="Rakshak Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">Operation</span>
                  <span className="text-2xl font-black text-white tracking-widest leading-none">
                    RAKSHAK <span className="text-red-500">3.0</span>
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1">Safer People. Stronger India.</span>
                </div>
              </div>

              {/* Command Center Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 shadow-black drop-shadow-md">
                  {activeTab === 'admin' ? 'Admin Command Center' :
                   activeTab === 'user' ? 'User Access Portal' :
                   activeTab === 'family' ? 'Family Access Portal' :
                   'Hospital Command Center'}
                </h2>
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span>Monitor</span>
                  <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                  <span>Respond</span>
                  <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                  <span>Protect</span>
                </div>
              </div>

              {/* Role Tabs Segmented Control */}
              <div className="flex bg-[#0B0F19] p-1 rounded-lg mb-6 border border-slate-800/80">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setActiveTab(tab.id); setError(''); setUserId(''); setPassword(''); setCarNumber(''); }}
                    className={cn(
                      "flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all",
                      activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {/* Fields */}
                    {activeTab === 'admin' && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter admin email"
                            className="w-full bg-[#0B0F19] border border-slate-800/80 rounded-lg py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'family' && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">Vehicle Number</label>
                        <div className="relative">
                          <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input 
                            type="text" 
                            value={carNumber}
                            onChange={(e) => setCarNumber(e.target.value)}
                            required
                            placeholder="e.g. DL 4C AB 1234"
                            className="w-full bg-[#0B0F19] border border-slate-800/80 rounded-lg py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 uppercase transition-colors placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab !== 'admin' && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                          {activeTab === 'user' ? 'User ID' : activeTab === 'family' ? 'Family ID' : 'Hospital ID'}
                        </label>
                        <div className="relative">
                          <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input 
                            type="text" 
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                            placeholder={activeTab === 'user' ? 'e.g. RR-2026-XXXXX' : 'Enter designated ID'}
                            className="w-full bg-[#0B0F19] border border-slate-800/80 rounded-lg py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Enter password"
                          className="w-full bg-[#0B0F19] border border-slate-800/80 rounded-lg py-3 pl-11 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400 font-medium text-center">{error}</p>
                  </motion.div>
                )}

                {/* Remember & Forgot Row */}
                <div className="flex items-center justify-between pt-1 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                      rememberMe ? "bg-blue-600 border-blue-600" : "bg-[#0B0F19] border-slate-600 group-hover:border-blue-500"
                    )}>
                      {rememberMe && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M3 7.5L5.5 10L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.value === 'true' || !rememberMe)}
                    />
                    <span className="text-sm text-slate-300 font-medium">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors">
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#1d4ed8] hover:bg-[#2563eb] text-white rounded-lg font-bold text-base shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Login <ArrowRight size={18} /></>
                  )}
                </button>
              </form>

              {/* Footer Decoration */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col items-center">
                <div className="text-[8px] text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-3 w-full px-8">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  SECURE ACCESS ONLY
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                
                <svg className="w-48 h-6 text-slate-700/40" viewBox="0 0 200 30" preserveAspectRatio="none">
                  <path d="M0,30 L0,28 L5,28 L5,20 L10,18 L15,20 L15,28 L25,28 L25,25 L30,22 L35,25 L35,28 L45,28 L45,15 L50,12 L55,15 L55,28 L65,28 L65,20 L75,20 L75,28 L85,28 L85,10 L90,5 L95,10 L95,28 L110,28 L110,15 L120,15 L120,28 L130,28 L130,22 L135,20 L140,22 L140,28 L150,28 L150,18 L155,16 L160,18 L160,28 L170,28 L170,24 L180,24 L180,28 L190,28 L190,20 L195,18 L200,20 L200,30 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
                
                <div className="text-[9px] font-bold text-white tracking-widest mt-1.5 uppercase">India Drives Safer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
hero = hero.replace(loginPanelRegex, newLoginPanel);

fs.writeFileSync('src/components/landing/HeroSection.tsx', hero);

// 4. Delete the unused modal file
if (fs.existsSync('src/components/landing/LoginModal.tsx')) {
  fs.unlinkSync('src/components/landing/LoginModal.tsx');
}

