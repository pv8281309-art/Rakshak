const fs = require('fs');

const loginModalCode = `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Fingerprint, Eye, EyeOff, X, Car } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
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

  if (!isOpen) return null;

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
            onClose();
            navigate('/admin/dashboard');
          } catch (err: any) {
            setError(err.message || 'Invalid admin credentials');
          }
        } else {
          if (email === 'admin@rakshak.in' && password === 'admin123') {
            if (typeof window !== 'undefined') (window as any).enableMockAdmin?.();
            onClose();
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
          onClose();
          navigate('/user/dashboard');
        } else {
          setError('Invalid User ID or Password');
        }
      }
      else if (activeTab === 'family') {
         if (userId && carNumber && password) {
            localStorage.setItem('rakshak_user_session', JSON.stringify({ role: 'family', id: userId, car: carNumber }));
            onClose();
            navigate('/family/dashboard');
         } else {
            setError('Please provide Car Number, User ID, and Password.');
         }
      }
      else if (activeTab === 'hospital') {
        if (userId === 'HOSP-001' && password === 'admin123') {
          localStorage.setItem('rakshak_user_session', JSON.stringify({ role: 'hospital', id: userId }));
          onClose();
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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[440px] bg-gradient-to-b from-[#1e2330] to-[#0a0d14] rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 p-8 pt-10"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

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

      </motion.div>
    </div>
  );
};
`
fs.writeFileSync('src/components/landing/LoginModal.tsx', loginModalCode);
