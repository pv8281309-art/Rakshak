import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, User, Users, Building2, ArrowLeft, ArrowRight, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role');

  const [selectedRole, setSelectedRole] = useState<string | null>(initialRole || null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    if (initialRole && ['admin', 'user', 'family', 'hospital'].includes(initialRole.toLowerCase())) {
      setSelectedRole(initialRole.toLowerCase());
    }
  }, [initialRole]);

  useEffect(() => {
    if (selectedRole) {
      const saved = localStorage.getItem(`rakshak_remembered_${selectedRole}`);
      if (saved) {
        setUserId(saved);
      } else {
        setUserId('');
      }
      setPassword('');
      setError('');
    }
  }, [selectedRole]);

  const roles = [
    {
      id: 'admin',
      name: 'ADMIN COMMAND',
      sub: 'Regional radar & emergency orchestration',
      desc: 'Monitor live emergency telemetry, coordinate hospital response, manage fleet dispatches, and configure multi-node security.',
      icon: Shield,
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
      accent: 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30',
      badge: 'bg-red-500/10 text-red-400 border-red-500/30',
      targetPath: '/admin/dashboard'
    },
    {
      id: 'user',
      name: 'DRIVER & USER',
      sub: 'Vehicle IoT sensor & personal safety',
      desc: 'Link your vehicle sensor device, register family emergency contacts, check live route status, and review trip telemetry logs.',
      icon: User,
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80',
      accent: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      targetPath: '/user/dashboard'
    },
    {
      id: 'family',
      name: 'FAMILY CIRCLE',
      sub: 'Instant alerts & live map tracking',
      desc: 'Keep your loved ones safe with automated collision notifications, live ambulance routing vector, and receiving hospital bay status.',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
      accent: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      targetPath: '/family/dashboard'
    },
    {
      id: 'hospital',
      name: 'TRAUMA HOSPITAL',
      sub: 'ICU pre-allocation & ambulance tracking',
      desc: 'Prepare emergency trauma wards before patient arrival, track incoming ALS ambulances, and update ICU & trauma bed capacities.',
      icon: Building2,
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
      accent: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      targetPath: '/hospital/overview'
    }
  ];

  const currentRoleConfig = roles.find(r => r.id === selectedRole);

  const handleRoleCardSelect = (roleId: string) => {
    setSelectedRole(roleId);
    navigate(`/login?role=${roleId}`, { replace: true });
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setError('');
    navigate('/login', { replace: true });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) return;
    if (!userId.trim() || !password.trim()) {
      setError('Please provide your credentials and password.');
      return;
    }

    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem(`rakshak_remembered_${selectedRole}`, userId.trim());
      } else {
        localStorage.removeItem(`rakshak_remembered_${selectedRole}`);
      }

      const res = await signIn(userId.trim(), password.trim(), selectedRole);

      if (res.success) {
        if (res.requiresPasswordChange) {
          navigate('/user/change-password', { replace: true });
          return;
        }

        switch (selectedRole) {
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'user':
            navigate('/user/dashboard', { replace: true });
            break;
          case 'family':
            navigate('/family/dashboard', { replace: true });
            break;
          case 'hospital':
            navigate('/hospital/overview', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
        }
      } else {
        setError('Invalid credentials or unauthorized role access.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen text-white font-sans flex flex-col justify-between selection:bg-red-500 selection:text-white bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url("/back.png")' }}
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[3px] pointer-events-none" />

      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl py-4 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all overflow-hidden p-0.5">
              <img src="/logo3.png" alt="Operation Rakshak Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-tight block uppercase">
                OPERATION RAKSHAK 3.0
              </span>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                SECURE PLATFORM GATEWAY
              </span>
            </div>
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-xs font-mono font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800"
          >
            <ArrowLeft size={14} />
            <span>Back to Public Site</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-center relative z-10">
        {!selectedRole ? (
          <div className="w-full space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono font-bold tracking-widest text-red-400 uppercase mb-4 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>MULTINODE AUTHENTICATION PORTAL</span>
              </div>
              <h1 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight uppercase text-white">
                CHOOSE YOUR <span className="text-red-500">ACCESS ROLE</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal">
                Select your designated system portal to enter the secure emergency-response ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {roles.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.id}
                    className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 hover:border-amber-500/60 transition-all duration-300 shadow-2xl flex flex-col justify-between group overflow-hidden"
                  >
                    <div>
                      <div className="relative h-40 overflow-hidden bg-slate-950">
                        <img 
                          src={r.image} 
                          alt={r.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                        
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-md ${r.badge}`}>
                            {r.name}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shadow-inner">
                            <Icon size={20} />
                          </div>
                          <div>
                            <h2 className="text-base font-black text-white tracking-tight uppercase">
                              {r.name}
                            </h2>
                            <p className="text-[11px] font-mono text-slate-400">
                              {r.sub}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-300 leading-relaxed font-normal">
                          {r.desc}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <button
                        onClick={() => handleRoleCardSelect(r.id)}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${r.accent}`}
                      >
                        <span>Access Portal</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-xs text-slate-400 font-mono">
              ● 256-BIT ENCRYPTION &nbsp;·&nbsp; ● ROLE-BASED ACCESS CONTROL &nbsp;·&nbsp; ● AUDIT LOGGED
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 border border-slate-800 shadow-2xl relative">
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <button
                  onClick={handleBackToRoles}
                  className="text-xs font-mono font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Roles</span>
                </button>

                {currentRoleConfig && (
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${currentRoleConfig.badge}`}>
                    {currentRoleConfig.name}
                  </span>
                )}
              </div>

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-inner">
                  {currentRoleConfig && <currentRoleConfig.icon size={26} />}
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                  {currentRoleConfig?.name} LOGIN
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Credentials managed via Admin Console
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 font-mono">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    User ID / Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter assigned User ID or Email"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-slate-950 transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    {selectedRole !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-mono font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-slate-950 transition-all font-mono pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-amber-500 border-slate-700 rounded focus:ring-amber-500 bg-slate-950 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-slate-300 select-none cursor-pointer">
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>LOGIN TO PORTAL</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>
        )}
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white uppercase font-mono text-amber-400">
              PASSWORD RESET BLOCKED
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Forgot password is blocked by admin and it can only be reset by admin panel. You should visit the nearest command center.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-800 bg-slate-950/90 py-6 text-center text-xs text-slate-400 font-mono relative z-10">
        © 2026 Operation Rakshak 3.0 · Coordinated Emergency Architecture · All rights reserved.
      </footer>
    </div>
  );
}
