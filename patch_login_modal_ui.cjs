const fs = require('fs');

const loginModalCode = `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Users, PlusSquare, ArrowRight, Lock, Mail, Fingerprint, Eye, EyeOff, X, Zap, ShieldCheck, Car } from 'lucide-react';
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
    { id: 'admin', label: 'ADMIN', icon: Shield },
    { id: 'user', label: 'USER', icon: User },
    { id: 'family', label: 'FAMILY', icon: Users },
    { id: 'hospital', label: 'HOSPITAL', icon: PlusSquare },
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-[1100px] h-[750px] max-h-[95vh] bg-[#0B0F17] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 text-slate-400 hover:text-white rounded-full transition-colors hover:bg-white/10"
        >
          <X size={24} />
        </button>

        {/* --- LEFT BRANDING PANEL --- */}
        <div className="hidden md:flex w-5/12 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
          {/* Background Image & Overlays */}
          <div className="absolute inset-0 z-0">
             <img 
               src="https://images.unsplash.com/photo-1555626906-fcf10d6851b4?q=80&w=2070&auto=format&fit=crop" 
               alt="City Night" 
               className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F17]/80 via-[#0B0F17]/70 to-[#0B0F17]/95"></div>
             {/* Map overlay hint (dots) */}
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center h-full">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              {/* Logo Box */}
              <div className="w-40 h-40 mb-8 relative drop-shadow-2xl flex items-center justify-center">
                <img src="/logo1.png" alt="Rakshak Logo" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]" />
              </div>

              {/* Titles */}
              <h1 className="text-4xl font-black text-white tracking-widest leading-tight mb-4">
                OPERATION<br/>RAKSHAK <span className="text-[#FF5500]">3.0</span>
              </h1>
              <p className="text-[13px] text-slate-300 mb-8 max-w-[280px] leading-relaxed">
                AI-Powered Accident Prevention, Detection & Emergency Response System
              </p>
              
              {/* Divider */}
              <div className="flex gap-1 mb-10 w-32">
                <div className="h-1 w-2/3 bg-[#FF5500] rounded-l-full"></div>
                <div className="h-1 w-1/3 bg-[#FF5500]/30 rounded-r-full"></div>
              </div>

              {/* Feature Icons Row */}
              <div className="flex justify-between w-full max-w-[280px] mb-10">
                <div className="flex flex-col items-center text-white gap-3">
                  <ShieldCheck size={28} className="font-light" strokeWidth={1.5} />
                  <span className="text-[11px] tracking-wider">Monitor</span>
                </div>
                <div className="flex flex-col items-center text-white gap-3">
                  <Zap size={28} className="font-light" strokeWidth={1.5} />
                  <span className="text-[11px] tracking-wider">Respond</span>
                </div>
                <div className="flex flex-col items-center text-white gap-3">
                  <Users size={28} className="font-light" strokeWidth={1.5} />
                  <span className="text-[11px] tracking-wider">Protect</span>
                </div>
              </div>

              {/* Quotes */}
              <div className="w-full text-left max-w-[280px]">
                <p className="italic font-serif text-slate-300 text-lg mb-2">" Every Second Matters "</p>
                <p className="text-[#FF5500] text-sm font-semibold tracking-wide">Safer People. Stronger India.</p>
              </div>
            </div>

            {/* Bottom Stats Banner */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 flex justify-between items-center backdrop-blur-md">
              <div className="text-center">
                <div className="text-white font-bold text-xl mb-0.5">24/7</div>
                <div className="text-[10px] text-slate-400">Monitoring</div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center">
                <div className="text-white font-bold text-xl mb-0.5">Faster</div>
                <div className="text-[10px] text-slate-400">Response</div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center">
                <div className="text-white font-bold text-xl mb-0.5">Safer</div>
                <div className="text-[10px] text-slate-400">Communities</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT LOGIN PANEL --- */}
        <div className="w-full md:w-7/12 p-8 md:p-14 lg:p-16 flex flex-col relative z-10 bg-[#0B0F17] overflow-y-auto">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Access Portal</h2>
            <p className="text-slate-400 text-sm">Select your designated role to continue.</p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-4 gap-3 md:gap-4 mb-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setError(''); setUserId(''); setPassword(''); setCarNumber(''); }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 py-4 rounded-xl border transition-all duration-200",
                    isActive 
                      ? "border-[#FF5500] bg-[#FF5500]/5 text-white shadow-[0_0_15px_rgba(255,85,0,0.1)]" 
                      : "border-slate-800 bg-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300"
                  )}
                >
                  <Icon size={24} className={isActive ? 'text-[#FF5500]' : ''} strokeWidth={1.5} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6 flex-1">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Conditional Fields based on Role */}
                {activeTab === 'admin' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Admin Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter admin email"
                        className="w-full bg-[#121824] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#FF5500] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'family' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Vehicle Number</label>
                    <div className="relative">
                      <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        value={carNumber}
                        onChange={(e) => setCarNumber(e.target.value)}
                        required
                        placeholder="e.g. DL 4C AB 1234"
                        className="w-full bg-[#121824] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#FF5500] uppercase transition-colors"
                      />
                    </div>
                  </div>
                )}

                {activeTab !== 'admin' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      {activeTab === 'user' ? 'User ID' : activeTab === 'family' ? 'Family ID' : 'Hospital ID'}
                    </label>
                    <div className="relative">
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="text" 
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                        placeholder={activeTab === 'user' ? 'e.g. RR-2026-XXXXX' : 'Enter designated ID'}
                        className="w-full bg-[#121824] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#FF5500] transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter password"
                      className="w-full bg-[#121824] border border-slate-800 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-[#FF5500] transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs text-red-400 font-medium text-center">{error}</p>
              </motion.div>
            )}

            {/* Remember & Forgot Row */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  rememberMe ? "bg-[#FF5500] border-[#FF5500]" : "bg-[#121824] border-slate-700 group-hover:border-[#FF5500]"
                )}>
                  {rememberMe && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M3 7.5L5.5 10L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.value === 'true' || !rememberMe)}
                />
                <span className="text-sm text-slate-300">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[#FF5500] hover:text-orange-400 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#FF6B00] to-[#FF4500] hover:from-[#FF7A1A] hover:to-[#FF5500] text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(255,85,0,0.2)] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Login <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          {/* Footer Decoration */}
          <div className="mt-10 pt-8 border-t border-slate-800/50 flex flex-col items-center">
            <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-4">
              <div className="h-px w-12 bg-slate-800"></div>
              SECURE ACCESS ONLY
              <div className="h-px w-12 bg-slate-800"></div>
            </div>
            
            {/* Minimal SVG Skyline */}
            <svg className="w-64 h-8 text-slate-700/50" viewBox="0 0 200 30" preserveAspectRatio="none">
              <path d="M0,30 L0,28 L5,28 L5,20 L10,18 L15,20 L15,28 L25,28 L25,25 L30,22 L35,25 L35,28 L45,28 L45,15 L50,12 L55,15 L55,28 L65,28 L65,20 L75,20 L75,28 L85,28 L85,10 L90,5 L95,10 L95,28 L110,28 L110,15 L120,15 L120,28 L130,28 L130,22 L135,20 L140,22 L140,28 L150,28 L150,18 L155,16 L160,18 L160,28 L170,28 L170,24 L180,24 L180,28 L190,28 L190,20 L195,18 L200,20 L200,30 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
            
            <div className="text-[10px] font-bold text-white tracking-widest mt-2 uppercase">India Drives Safer</div>
            
            {/* Tricolor underline */}
            <div className="flex gap-0.5 mt-1">
              <div className="w-3 h-0.5 bg-[#138808] rounded-full"></div>
              <div className="w-3 h-0.5 bg-white rounded-full"></div>
              <div className="w-3 h-0.5 bg-[#FF9933] rounded-full"></div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/landing/LoginModal.tsx', loginModalCode);
