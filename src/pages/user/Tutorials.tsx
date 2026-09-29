import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Video, 
  BookOpen, 
  ShieldAlert, 
  Navigation, 
  Phone, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  Volume2, 
  Maximize2,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TutorialChapter {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: any;
}

export default function Tutorials() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [activeVideoSrc, setActiveVideoSrc] = useState<string>('');
  const [activeChapter, setActiveChapter] = useState('sos');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const chapters: TutorialChapter[] = [
    {
      id: 'sos',
      time: '01:15',
      title: 'Triggering Emergency SOS & Cancellation',
      description: 'Learn how to use the single-tap Emergency SOS panic trigger, transmit GPS telemetry, and cancel false alarms safely.',
      icon: ShieldAlert,
    },
    {
      id: 'tracking',
      time: '02:45',
      title: 'Live Ambulance & Hospital Telemetry',
      description: 'Understanding real-time wait times, ambulance driver dispatch, hospital trauma bay preparation, and live GPS map tracking.',
      icon: Navigation,
    },
    {
      id: 'contacts',
      time: '04:10',
      title: 'Emergency Contacts & Family Notification',
      description: 'Add and verify emergency contacts who will automatically receive instant alerts and location broadcast upon incident.',
      icon: Phone,
    },
    {
      id: 'hospitals',
      time: '05:30',
      title: 'Trauma Centers & Hospital Resources',
      description: 'Find nearby emergency facilities, live bed availability, direct triage hotline numbers, and ambulance arrival corridors.',
      icon: BookOpen,
    },
  ];

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customVideoUrl.trim()) {
      setActiveVideoSrc(customVideoUrl.trim());
      setIsPlaying(true);
      setShowUrlInput(false);
    }
  };

  // Helper to check if URL is YouTube embed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <BookOpen size={24} />
            </span>
            User Guide & Video Tutorials
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Master Operation Rakshak's emergency life-saving protocols and dispatch features.
          </p>
        </div>

        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <Video size={16} className="text-blue-400" />
          {showUrlInput ? 'Hide Video Settings' : 'Add / Change Video Source'}
        </button>
      </div>

      {/* Video Source Configuration Box */}
      {showUrlInput && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 border border-blue-500/40 rounded-2xl p-6 shadow-xl space-y-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                Custom Video Guide Configuration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste your video guide URL (YouTube link, MP4 URL, or custom video embed) to replace the tutorial video.
              </p>
            </div>
            {activeVideoSrc && (
              <button 
                onClick={() => setActiveVideoSrc('')}
                className="text-xs text-red-400 hover:text-red-300 underline"
              >
                Reset to Default Guide
              </button>
            )}
          </div>

          <form onSubmit={handleApplyUrl} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              placeholder="e.g. https://www.youtube.com/watch?v=... or https://example.com/guide.mp4"
              value={customVideoUrl}
              onChange={(e) => setCustomVideoUrl(e.target.value)}
              className="flex-1 bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Apply Video
            </button>
          </form>
        </motion.div>
      )}

      {/* Main Video Hero Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video w-full bg-[#020617] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center group">
            {activeVideoSrc ? (
              activeVideoSrc.includes('youtube') || activeVideoSrc.includes('youtu.be') ? (
                <iframe
                  src={getEmbedUrl(activeVideoSrc)}
                  title="Operation Rakshak Video Tutorial"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideoSrc}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              // Default Interactive Player Mockup
              <div className="relative w-full h-full flex flex-col justify-between p-6 bg-gradient-to-tr from-[#020617] via-[#091122] to-[#0d1c38]">
                {/* Visual Grid Overlay */}
                <div 
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
                />

                {/* Top Overlay Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/40 rounded-full text-red-400 text-xs font-semibold tracking-wider uppercase">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Official Guide Video
                  </div>
                  <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                    Operation Rakshak 3.0
                  </div>
                </div>

                {/* Center Play Button Action */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto space-y-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)] border-4 border-white/20 transition-all hover:scale-105 active:scale-95"
                    aria-label="Play tutorial video"
                  >
                    {isPlaying ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-white">How to Use Operation Rakshak</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {isPlaying 
                        ? 'Video is currently playing. Click to pause or customize video source.'
                        : 'Watch the step-by-step walkthrough of SOS trigger, ambulance response, and hospital triage.'}
                    </p>
                  </div>
                </div>

                {/* Bottom Scrubber Bar */}
                <div className="relative z-10 w-full space-y-2">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`bg-blue-500 h-full rounded-full ${isPlaying ? 'w-2/5 animate-pulse' : 'w-1/4'}`} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{isPlaying ? '02:14' : '00:00'}</span>
                    <div className="flex items-center gap-3">
                      <Volume2 size={16} className="cursor-pointer hover:text-white" />
                      <Maximize2 size={16} className="cursor-pointer hover:text-white" />
                      <span>06:45</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Description Card */}
          <div className="bg-[#020617]/50 rounded-2xl p-6 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">
              Guide Overview: Operation Rakshak Rapid Emergency Response
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Operation Rakshak is designed to minimize critical response time during vehicle accidents and medical emergencies. 
              In this video guide, learn how instant GPS telemetry connects you to the central control command center, alerts 
              the nearest trauma hospital, and automatically dispatches Advanced Life Support (ALS) ambulances within seconds.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs px-2.5 py-1 bg-slate-900 text-slate-300 rounded-lg border border-slate-800">
                #EmergencyProtocol
              </span>
              <span className="text-xs px-2.5 py-1 bg-slate-900 text-slate-300 rounded-lg border border-slate-800">
                #AmbulanceTracking
              </span>
              <span className="text-xs px-2.5 py-1 bg-slate-900 text-slate-300 rounded-lg border border-slate-800">
                #HospitalTriage
              </span>
              <span className="text-xs px-2.5 py-1 bg-slate-900 text-slate-300 rounded-lg border border-slate-800">
                #OperationRakshak
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Video Chapters & Quick Guides */}
        <div className="space-y-4">
          <div className="bg-[#020617]/50 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                Video Chapters
              </h3>
              <span className="text-xs text-slate-500 font-mono">4 Modules</span>
            </div>

            <div className="space-y-2">
              {chapters.map((ch) => {
                const IconComponent = ch.icon;
                const isActive = activeChapter === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapter(ch.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isActive 
                        ? 'bg-blue-500/10 border-blue-500/40 text-white' 
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <IconComponent size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold truncate text-white">{ch.title}</p>
                        <span className="font-mono text-xs text-blue-400 flex-shrink-0">{ch.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {ch.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Help Box */}
          <div className="bg-gradient-to-br from-red-500/10 via-slate-900/60 to-slate-900/90 rounded-2xl p-5 border border-red-500/20 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <ShieldAlert size={18} />
              In an Active Life-Threatening Situation?
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Do not wait to watch the tutorial if you require immediate help. Use the 
              Emergency SOS button on the home dashboard or dial Emergency Services (112) directly.
            </p>
            <a 
              href="tel:112"
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
            >
              <Phone size={14} /> Call Emergency 112 Now
            </a>
          </div>
        </div>
      </div>

      {/* Step-by-Step Interactive Visual Guide */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-blue-400" />
          Step-by-Step Operation Guide
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#020617]/50 rounded-2xl p-6 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-white">Triggering the SOS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Press the large red SOS button on your User Dashboard. The system immediately captures your real GPS coordinates and transmits an active priority alert to the central command hub.
            </p>
          </div>

          <div className="bg-[#020617]/50 rounded-2xl p-6 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-white">Control Room Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Admin Command Center reviews the alert, validates telemetry, reserves emergency beds at the closest hospital (e.g. AIIMS Trauma Center), and assigns the nearest ALS ambulance.
            </p>
          </div>

          <div className="bg-[#020617]/50 rounded-2xl p-6 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-white">Live Tracking & Arrival</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open the Live Tracking screen to view your ambulance's real-time position, estimated wait time, driver phone number, and direct contact line with the hospital trauma team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
