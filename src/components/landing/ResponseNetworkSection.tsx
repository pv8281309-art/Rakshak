import React, { useState, useEffect } from 'react';
import { Shield, User, Users, Building2, Ambulance, Cpu, Activity, Radio, Zap, Globe, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ResponseNetworkSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'topology' | 'telemetry' | 'nodes'>('topology');
  const [packetCount, setPacketCount] = useState(1429);
  const [selectedNode, setSelectedNode] = useState<string | null>('ambulance');

  useEffect(() => {
    const interval = setInterval(() => {
      setPacketCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const nodesData = {
    user: {
      title: "DRIVER / SMART DEVICE",
      icon: User,
      color: "blue",
      badge: "TRIGGER SOURCE",
      latency: "12ms",
      status: "ARMED & LISTENING",
      desc: "Instant g-force impact trigger & manual SOS trigger instantly broadcasts crash coordinates and biometric telemetry.",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
    },
    family: {
      title: "FAMILY CIRCLE",
      icon: Users,
      color: "emerald",
      badge: "INSTANT NOTIFICATION",
      latency: "28ms",
      status: "ALERTED VIA SMS & PUSH",
      desc: "Immediate SMS dispatch containing live Google Maps tracking, emergency contact lines, and dispatch status.",
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80"
    },
    ambulance: {
      title: "AMBULANCE FLEET",
      icon: Ambulance,
      color: "orange",
      badge: "OPTIMIZED ROUTING",
      latency: "19ms",
      status: "DISPATCHED",
      desc: "Nearest available GPS-vetted emergency unit receives dynamic routing bypassing traffic signals.",
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
    },
    hospital: {
      title: "TRAUMA CENTER",
      icon: Building2,
      color: "red",
      badge: "ICU PRE-ALLOCATION",
      latency: "34ms",
      status: "BED PREPARED",
      desc: "Receives real-time victim vitals, estimated arrival countdown, and injury severity index prior to arrival.",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80"
    }
  };

  return (
    <section id="response-network" className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white font-sans relative overflow-hidden">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[200px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono font-bold tracking-widest text-red-400 uppercase mb-4 shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>MULTI-MODE TOPOLOGY & LIVE ORCHESTRATION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] uppercase">
            ONE CRASH EVENT.<br />
            <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              FOUR PARALLEL NODES.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed font-medium">
            Our multi-node synchronization protocol guarantees instantaneous, zero-delay broadcasts across emergency responders, trauma centers, and families.
          </p>

          {/* Interactive Mode Switcher Tabs */}
          <div className="mt-8 inline-flex p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-xl">
            <button
              onClick={() => setActiveTab('topology')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'topology'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={14} />
              <span>TOPOLOGY MAP</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'telemetry'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity size={14} />
              <span>LIVE TELEMETRY STREAM</span>
            </button>
            <button
              onClick={() => setActiveTab('nodes')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'nodes'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield size={14} />
              <span>NODE BREAKDOWN</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Panels */}
        <div className="mt-12">
          {activeTab === 'topology' && (
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
              
              {/* Background Cyber Grid */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }}
              />

              <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
                
                {/* 1. TOP SOURCE: CRASH SENSOR */}
                <div className="flex flex-col items-center">
                  <div className="px-6 py-3.5 rounded-2xl bg-slate-900/90 border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center gap-3.5 backdrop-blur-md">
                    <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
                      <Activity size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-bold text-red-400 tracking-wider">IMPACT DETECTED (9.4G)</div>
                      <div className="text-sm font-black text-white tracking-wide">RAKSHAK 3.0 IoT VEHICLE SENSOR</div>
                    </div>
                  </div>

                  {/* Animated Connecting Line */}
                  <div className="w-0.5 h-14 bg-gradient-to-b from-red-500 via-orange-500 to-blue-500 relative my-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 -left-[4px] absolute animate-ping top-1/2" />
                  </div>
                </div>

                {/* 2. CENTER NODE: CLOUD ORCHESTRATION HUB */}
                <div className="relative group my-2 w-full max-w-md">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-2 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)] text-center relative overflow-hidden">
                    
                    <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500/20 border-b border-l border-blue-500/30 text-[10px] font-mono text-blue-300 rounded-bl-xl">
                      PACKETS: {packetCount}
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/50 text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <Cpu size={26} className="animate-spin" style={{ animationDuration: '12s' }} />
                    </div>
                    
                    <div className="text-xs font-mono tracking-widest text-blue-400 uppercase font-bold">
                      CENTRAL ORCHESTRATION HUB
                    </div>
                    <div className="text-lg font-black tracking-tight text-white mt-1">
                      RAKSHAK EMERGENCY SYSTEM
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Instant multi-threading protocol broadcasts GPS coordinates, severity metrics, and priority routing vectors simultaneously.
                    </p>
                  </div>
                </div>

                {/* Connecting Fan-Out Line */}
                <div className="w-0.5 h-10 bg-blue-500/60 relative my-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400 -left-[3px] absolute bottom-0 animate-ping" />
                </div>

                <div className="mb-4">
                  <div className="px-5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 shadow-xl flex items-center gap-2.5 text-xs font-mono font-bold text-slate-200">
                    <ShieldAlert size={15} className="text-red-500" />
                    <span>PARALLEL DISPATCH ENGINE (4 THREADS ACTIVE)</span>
                  </div>
                </div>

                {/* 4. FOUR PERIPHERAL CONNECTED RECEPTOR NODES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full mt-4">
                  
                  {/* NODE 1: USER */}
                  <div className="bg-slate-900/90 hover:bg-slate-800/90 transition-all rounded-2xl p-4 border border-slate-800 hover:border-blue-500/50 text-center shadow-lg group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <User size={18} />
                    </div>
                    <div className="text-xs font-mono font-bold text-blue-400">01. DRIVER</div>
                    <div className="text-sm font-bold text-white mt-1">Automated SOS State</div>
                    <div className="text-[11px] text-slate-400 mt-1">Direct vehicle link & voice check-in</div>
                  </div>

                  {/* NODE 2: FAMILY */}
                  <div className="bg-slate-900/90 hover:bg-slate-800/90 transition-all rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/50 text-center shadow-lg group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Users size={18} />
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-400">02. FAMILY</div>
                    <div className="text-sm font-bold text-white mt-1">Instant SMS & Map</div>
                    <div className="text-[11px] text-slate-400 mt-1">Live tracking & emergency dial link</div>
                  </div>

                  {/* NODE 3: AMBULANCE */}
                  <div className="bg-slate-900/90 hover:bg-slate-800/90 transition-all rounded-2xl p-4 border border-slate-800 hover:border-orange-500/50 text-center shadow-lg group">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Ambulance size={18} />
                    </div>
                    <div className="text-xs font-mono font-bold text-orange-400">03. AMBULANCE</div>
                    <div className="text-sm font-bold text-white mt-1">Vector Dispatch</div>
                    <div className="text-[11px] text-slate-400 mt-1">Turn-by-turn priority navigation</div>
                  </div>

                  {/* NODE 4: HOSPITAL */}
                  <div className="bg-slate-900/90 hover:bg-slate-800/90 transition-all rounded-2xl p-4 border border-slate-800 hover:border-red-500/50 text-center shadow-lg group">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Building2 size={18} />
                    </div>
                    <div className="text-xs font-mono font-bold text-red-400">04. HOSPITAL</div>
                    <div className="text-sm font-bold text-white mt-1">ICU Pre-Alert</div>
                    <div className="text-[11px] text-slate-400 mt-1">Trauma bay & vitals readiness</div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-4 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>REAL-TIME STREAM ACTIVE</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase">
                    SUB-SECOND PACKET DELIVERY
                  </h3>
                  <p className="mt-4 text-slate-400 leading-relaxed text-sm sm:text-base">
                    When an accident is registered by the sensor, encrypted telemetry packets are transmitted over secure cellular and satellite uplinks with sub-50ms latency.
                  </p>
                  
                  <div className="mt-6 space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">[PACKET #8492] SENSOR ACCELERATION</span>
                      <span className="text-red-400 font-bold">9.4 G-FORCE</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">[PACKET #8493] GEO-COORDINATES</span>
                      <span className="text-blue-400 font-bold">28.6139° N, 77.2090° E</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">[PACKET #8494] DISPATCH STATUS</span>
                      <span className="text-emerald-400 font-bold">4/4 NODES NOTIFIED (19ms)</span>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" 
                    alt="Command Center Telemetry" 
                    className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <div className="text-xs font-mono text-slate-300">SECURE DISPATCH NODE #402</div>
                    <div className="text-sm font-bold text-white">AI Command Center Visualization</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(nodesData).map(([key, node]) => {
                const IconComponent = node.icon;
                return (
                  <div 
                    key={key} 
                    onClick={() => setSelectedNode(key)}
                    className={`p-6 rounded-3xl bg-slate-900/90 border transition-all cursor-pointer relative overflow-hidden group ${
                      selectedNode === key 
                        ? 'border-red-500 shadow-xl shadow-red-500/10' 
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none" />
                    
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 shrink-0 relative">
                        <img src={node.image} alt={node.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-slate-950/30" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono tracking-wider font-bold text-red-400 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                            {node.badge}
                          </span>
                          <span className="text-xs font-mono text-slate-400">LATENCY: {node.latency}</span>
                        </div>
                        <h4 className="text-lg font-black text-white mt-2">{node.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{node.desc}</p>
                        
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                          <CheckCircle2 size={14} />
                          <span>STATUS: {node.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
