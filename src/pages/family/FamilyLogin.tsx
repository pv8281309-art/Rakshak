import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Car, Users, ArrowRight, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FamilyLogin() {
  const [vehicleReg, setVehicleReg] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!vehicleReg.trim() && !familyId.trim()) {
      setError('Please enter your Vehicle Registration Number or Family ID.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      // Pass familyId (or vehicleReg as fallback), password, role 'family', and carNumber/vehicleReg
      const primaryId = familyId.trim() || vehicleReg.trim();
      const secondaryId = vehicleReg.trim() || familyId.trim();
      const result = await signIn(primaryId, password.trim(), 'family', {
        carNumber: secondaryId
      });

      if (result.success) {
        navigate('/family/dashboard', { replace: true });
      } else {
        setError('Invalid Family credentials. Please verify your Family ID, Vehicle Number, and Password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060D1A] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#060D1A] opacity-90"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 mx-auto bg-slate-900/90 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center justify-center mb-5 relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-indigo-500/10"></div>
             <Users size={38} className="text-indigo-400 relative z-10" />
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-3xl font-bold text-white tracking-wider mb-1"
          >
            OPERATION <span className="text-indigo-400">RAKSHAK 3.0</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-indigo-300/80 font-medium tracking-wide uppercase text-xs"
          >
            Family Vehicle Tracking Portal
          </motion.p>
          
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-px w-20 bg-indigo-500/40 mx-auto mt-3"
          />
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-slate-900/85 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl"
        >
          {/* Information badge */}
          <div className="mb-6 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-start gap-2.5 text-xs text-indigo-200">
            <ShieldCheck size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <p>
              Family access is interconnected with the registered vehicle number and shares the same password as the User ID.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Field 1: Vehicle Registration Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Vehicle Registration Number</span>
                <span className="text-[10px] text-slate-400 font-normal">Registered by Admin</span>
              </label>
              <div className="relative">
                <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                  placeholder="e.g. UP 31 AE 3521 or DL 01 AX 4589"
                  className="w-full bg-[#060D1A] border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors uppercase font-mono placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Field 2: Family ID */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Family ID</span>
                <span className="text-[10px] text-indigo-400 font-normal font-mono">FAM + 4 Digits</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value.toUpperCase())}
                  placeholder="e.g. FAM1518 or FAM1001"
                  className="w-full bg-[#060D1A] border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors uppercase font-mono placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Field 3: Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-400 font-normal">Same as User ID</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter account password"
                  className="w-full bg-[#060D1A] border border-slate-700/80 rounded-xl py-3 pl-11 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <p className="text-xs text-red-400 font-medium text-center">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Access Family Dashboard</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <Link to="/user/login" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft size={13} />
              Driver / User Login
            </Link>
            <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Return to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
