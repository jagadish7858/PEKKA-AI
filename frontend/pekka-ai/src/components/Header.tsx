import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Play, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Layers, 
  Radio, 
  Cpu
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';

export const Header: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    soundEnabled, 
    setSoundEnabled, 
    startLiveDemo, 
    demoActive, 
    resetInfrastructure,
    isInterventionApproved,
    isBackendOnline,
    activeSensorsCount,
    lastTelemetryUpdate,
    detectedScenario
  } = usePekka();

  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 marble-texture border-b border-tactical px-5 flex items-center justify-between z-30 select-none shadow-md">
      {/* Left: Branding & Tagline */}
      <div className="flex items-center space-x-3.5">
        <div 
          onClick={() => setViewMode(viewMode === 'landing' ? 'app' : 'landing')}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Click to toggle Landing Page"
        >
          {/* Luxury Geometric Gold P Logo */}
          <div className="relative w-9 h-9 rounded-lg bg-[#0B1310] border border-[#C9A227]/40 flex items-center justify-center overflow-hidden group-hover:border-[#C9A227] transition-all shadow-[0_0_12px_rgba(201,162,39,0.2)]">
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <path d="M28 22H62C72 22 80 30 80 42C80 54 72 62 62 62H42V78" stroke="#C9A227" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M28 22V78" stroke="#C9A227" strokeWidth="9" strokeLinecap="round"/>
              <circle cx="28" cy="22" r="4.5" fill="#F2EDE0" />
              <circle cx="62" cy="22" r="4" fill="#8FBFA3" />
              <circle cx="80" cy="42" r="5.5" fill="#EF4444" className="animate-ping" style={{ transformOrigin: '80px 42px' }} />
              <circle cx="80" cy="42" r="5" fill="#EF4444" />
              <circle cx="42" cy="78" r="4" fill="#3E7A4F" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold tracking-wider text-[#F2EDE0] text-base flex items-center">
                PEKKA<span className="text-[#C9A227] italic font-normal ml-1">AI</span>
              </span>
              <span className="text-[10px] text-[#C9A227] px-2 py-0.5 rounded bg-[#C9A227]/10 border border-[#C9A227]/30 font-telemetry tracking-wider uppercase">
                Aurelia // 2026
              </span>
            </div>
            <p className="text-[10px] text-[#8FBFA3] tracking-wide font-sans uppercase hidden sm:block">
              Autonomous Critical Infrastructure Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Mission Control Status Badges */}
      <div className="hidden lg:flex items-center space-x-3 text-xs">
        {/* Backend Online / Offline */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all ${
          isBackendOnline 
            ? 'bg-[#0B1310]/80 border-tactical text-slate-300' 
            : 'bg-red-950/70 border-red-500/60 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isBackendOnline 
              ? 'bg-[#3E7A4F] shadow-[0_0_8px_#3E7A4F] animate-pulse' 
              : 'bg-red-500 shadow-[0_0_8px_#EF4444] animate-ping'
          }`} />
          <span className="text-[11px] font-sans tracking-wide uppercase font-semibold">
            {isBackendOnline ? 'PEKKA AI Online (:8001)' : 'PEKKA AI Backend Offline'}
          </span>
        </div>

        {/* Live Scenario Badge */}
        <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-telemetry font-bold tracking-wider uppercase ${
          detectedScenario === 'CRITICAL'
            ? 'bg-red-950/60 text-red-400 border-red-500/50 animate-pulse'
            : detectedScenario === 'WARNING'
            ? 'bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227]/50'
            : 'bg-[#10201A] text-[#3E7A4F] border-[#3E7A4F]/60'
        }`}>
          <span className="text-[10px]">SCENARIO:</span>
          <span>{detectedScenario}</span>
        </div>

        {/* Active Probes */}
        {isBackendOnline && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0B1310]/80 border border-tactical">
            <Cpu className="w-3.5 h-3.5 text-[#C9A227]" />
            <span className="text-[11px] font-sans text-[#B8C4BA] uppercase tracking-wider">Telemetry</span>
            <span className="text-[11px] font-serif font-bold text-[#C9A227] tabular-nums">
              {activeSensorsCount} Probes
            </span>
          </div>
        )}

        {/* Human Oversight Active */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-[11px] transition-colors ${
          isInterventionApproved 
            ? 'bg-[#10201A] border-[#3E7A4F]/60 text-[#8FBFA3]' 
            : 'bg-[#C9A227]/10 border-[#C9A227]/40 text-[#F2EDE0]'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
          <span className="font-sans font-medium tracking-wide uppercase">Operator Advisory Gate</span>
        </div>

        {/* Live Indicator */}
        <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] ${
          isBackendOnline
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
            : 'bg-red-950/40 border-red-500/40 text-red-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-400' : 'bg-red-500'} animate-ping`} />
          <span className="font-telemetry font-bold tracking-widest text-[10px]">
            {isBackendOnline ? (lastTelemetryUpdate || 'LIVE') : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Right: Quick Controls, Demo Launcher & Clock */}
      <div className="flex items-center space-x-2.5">
        {/* 60s Live Demo Button */}
        <button
          onClick={startLiveDemo}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold tracking-wider flex items-center space-x-1.5 border transition-all ${
            demoActive 
              ? 'bg-[#C9A227] text-[#0B1310] border-[#C9A227] shadow-[0_0_15px_rgba(201,162,39,0.5)]'
              : 'bg-[#C9A227]/10 hover:bg-[#C9A227]/20 text-[#C9A227] border-[#C9A227]/40 hover:border-[#C9A227]'
          }`}
          title="Start 60-Second Interactive Demonstration Scenario"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${demoActive ? 'animate-spin' : ''}`} />
          <span>LIVE DEMO</span>
          <span className="text-[10px] opacity-80 hidden sm:inline">(60s)</span>
        </button>

        {/* Landing Page Toggle */}
        <button
          onClick={() => setViewMode(viewMode === 'landing' ? 'app' : 'landing')}
          className="px-3 py-1.5 rounded-lg bg-[#0B1310] hover:bg-[#152B23] border border-tactical hover:border-[#C9A227]/50 text-[#B8C4BA] hover:text-[#F2EDE0] text-xs font-sans flex items-center space-x-1.5 transition-colors"
          title="Toggle Landing Page / Operations Command Center"
        >
          {viewMode === 'landing' ? (
            <>
              <Radio className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="hidden sm:inline font-medium">COMMAND CENTER</span>
            </>
          ) : (
            <>
              <Layers className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="hidden sm:inline font-medium">LANDING PAGE</span>
            </>
          )}
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg border border-tactical transition-colors ${
            soundEnabled 
              ? 'bg-[#0B1310] text-[#C9A227] border-[#C9A227]/40 hover:border-[#C9A227]' 
              : 'bg-[#0B1310] text-slate-500 hover:text-[#B8C4BA]'
          }`}
          title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Reset State */}
        <button
          onClick={resetInfrastructure}
          className="p-2 rounded-lg bg-[#0B1310] border border-tactical text-slate-400 hover:text-[#F2EDE0] hover:border-[#C9A227]/40 transition-colors"
          title="Reset Simulation to Initial State"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Real-time Clock */}
        <div className="hidden xl:flex items-center px-3 py-1.5 rounded-lg bg-[#0B1310] border border-tactical font-telemetry text-xs text-[#8FBFA3] tabular-nums">
          {timeStr || '10:00:00 UTC'}
        </div>
      </div>
    </header>
  );
};
