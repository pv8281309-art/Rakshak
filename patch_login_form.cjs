const fs = require('fs');

const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStart = `{/* Right Side: Login Cards */}`;
const targetEnd = `</div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}`;

// Extract everything from targetStart to targetEnd
const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(`{/* Stats Strip */}`);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find targets");
  process.exit(1);
}

const before = content.substring(0, startIndex);
const after = content.substring(endIndex);

const newLoginPanel = `{/* Right Side: Login Cards */}
          <div className="flex flex-col items-center justify-center md:justify-end lg:justify-center w-full md:w-auto flex-1 max-w-md lg:max-w-[460px] mx-auto md:mx-0">
            <div className="relative w-full">
              <div className="bg-[#0f172a]/40 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 p-6 lg:p-7">
                
                {/* Top Logo & Title */}
                <div className="flex flex-col items-center justify-center gap-3 mb-5 text-center">
                  <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-2xl border border-slate-700/50 flex items-center justify-center p-1.5 shadow-lg shrink-0">
                     <img src="/logo1.png" alt="Rakshak Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-300 tracking-[0.25em] uppercase mb-1">Operation</span>
                    <span className="text-3xl font-black text-white tracking-wider leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      RAKSHAK <span className="text-red-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.4)]">3.0</span>
                    </span>
                  </div>
                </div>

                {/* Role Tabs Segmented Control */}
                <div className="flex bg-[#0B0F19]/50 p-1 rounded-lg mb-5 border border-slate-700/50 backdrop-blur-md">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => { setActiveTab(tab.id); setError(''); setUserId(''); setPassword(''); setCarNumber(''); }}
                      className={cn(
                        "flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all",
                        activeTab === tab.id ? "bg-blue-600/90 text-white shadow-md shadow-blue-900/50" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3.5"
                    >
                      {/* Fields */}
                      {activeTab === 'admin' && (
                        <div>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              type="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              placeholder="Admin Email Address"
                              className="w-full bg-[#020617]/50 border border-slate-700/50 rounded-lg py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500 backdrop-blur-md"
                            />
                          </div>
                        </div>
                      )}

                      {activeTab === 'family' && (
                        <div>
                          <div className="relative">
                            <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              type="text" 
                              value={carNumber}
                              onChange={(e) => setCarNumber(e.target.value)}
                              required
                              placeholder="Vehicle Number (e.g. DL 4C AB 1234)"
                              className="w-full bg-[#020617]/50 border border-slate-700/50 rounded-lg py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 uppercase transition-colors placeholder:text-slate-500 backdrop-blur-md"
                            />
                          </div>
                        </div>
                      )}

                      {activeTab !== 'admin' && (
                        <div>
                          <div className="relative">
                            <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              type="text" 
                              value={userId}
                              onChange={(e) => setUserId(e.target.value)}
                              required
                              placeholder={activeTab === 'user' ? 'User ID (e.g. RR-2026-XXXX)' : activeTab === 'family' ? 'Family ID' : 'Hospital ID'}
                              className="w-full bg-[#020617]/50 border border-slate-700/50 rounded-lg py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500 backdrop-blur-md"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Password"
                            className="w-full bg-[#020617]/50 border border-slate-700/50 rounded-lg py-2.5 pl-11 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500 backdrop-blur-md"
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
                    </motion.div>
                  </AnimatePresence>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-md">
                      <p className="text-xs text-red-400 font-medium text-center">{error}</p>
                    </motion.div>
                  )}

                  {/* Remember & Forgot Row */}
                  <div className="flex items-center justify-between pt-1 pb-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        rememberMe ? "bg-blue-600 border-blue-600" : "bg-[#020617]/60 border-slate-500 group-hover:border-blue-400"
                      )}>
                        {rememberMe && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-white"><path d="M3 7.5L5.5 10L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.value === 'true' || !rememberMe)}
                      />
                      <span className="text-xs text-slate-300 font-medium drop-shadow-md">Remember me</span>
                    </label>
                    <button type="button" className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors drop-shadow-md">
                      Forgot password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 border border-blue-500/50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>Secure Login <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>

                {/* Secure Access Footer */}
                <div className="mt-5 text-center">
                  <div className="text-[9px] font-bold text-slate-400/80 tracking-[0.2em] uppercase">
                    Secured Access Only
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      
      `;

fs.writeFileSync(filePath, before + newLoginPanel + after);

