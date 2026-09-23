import React from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';
import { LIVE_DEMO_PHASES } from '../data/mockData';

export const LiveDemoController: React.FC = () => {
  const { 
    demoActive, 
    demoCurrentStep, 
    demoIsPaused, 
    stopLiveDemo, 
    nextDemoStep, 
    prevDemoStep, 
    toggleDemoPause,
    setDemoStep,
    isInterventionApproved 
  } = usePekka();

  if (!demoActive) return null;

  const currentPhase = LIVE_DEMO_PHASES[demoCurrentStep - 1] || LIVE_DEMO_PHASES[0];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="marble-texture border border-[#C9A227]/40 rounded-xl shadow-[0_0_35px_rgba(201,162,39,0.25)] p-4.5 text-[#F2EDE0]">
        
        {/* Top HUD Line */}
        <div className="flex items-center justify-between pb-2.5 border-b border-tactical">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A227] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C9A227]"></span>
            </span>
            <span className="font-serif text-xs font-bold text-[#C9A227] tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              PEKKA AI 60-Second Scenario
            </span>
            <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#C9A227]">
              JUDGE DEMO MODE
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="font-telemetry text-xs text-[#8FBFA3]">
              Phase <span className="text-[#C9A227] font-bold">{demoCurrentStep}</span> of {LIVE_DEMO_PHASES.length}
            </span>
            <button
              onClick={stopLiveDemo}
              className="p-1.5 rounded-lg hover:bg-[#0B1310] text-[#708778] hover:text-[#F2EDE0] transition-colors"
              title="Exit Demo Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Phase Step Scrubber Bars */}
        <div className="grid grid-cols-11 gap-1.5 py-3">
          {LIVE_DEMO_PHASES.map((phase) => {
            const isCompleted = phase.step < demoCurrentStep;
            const isCurrent = phase.step === demoCurrentStep;
            return (
              <button
                key={phase.step}
                onClick={() => setDemoStep(phase.step)}
                className={`h-1.5 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-[#C9A227] shadow-[0_0_8px_#C9A227] scale-y-125'
                    : isCompleted
                    ? 'bg-[#8FBFA3]/60'
                    : 'bg-[#0B1310] border border-[#2A3B32] hover:bg-[#152B23]'
                }`}
                title={`${phase.phaseName}: ${phase.title}`}
              />
            );
          })}
        </div>

        {/* Phase Details & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="space-y-1 flex-1">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-telemetry font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                currentPhase.badge.includes('CRITICAL') || currentPhase.badge.includes('87%')
                  ? 'bg-red-950/60 text-red-400 border-red-500/50 animate-pulse'
                  : currentPhase.badge.includes('MITIGATED')
                  ? 'bg-[#10201A] text-[#3E7A4F] border-[#3E7A4F]/60'
                  : 'bg-[#C9A227]/15 text-[#C9A227] border-[#C9A227]/40'
              }`}>
                {currentPhase.badge}
              </span>
              <h3 className="font-serif text-sm font-semibold text-[#F2EDE0]">
                {currentPhase.title}
              </h3>
            </div>
            <p className="text-xs text-[#B8C4BA] font-sans leading-relaxed">
              {currentPhase.description}
            </p>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center font-serif">
            <button
              onClick={prevDemoStep}
              disabled={demoCurrentStep <= 1}
              className="px-3 py-1.5 rounded-lg bg-[#0B1310] hover:bg-[#152B23] border border-tactical disabled:opacity-40 text-[#B8C4BA] text-xs flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </button>

            <button
              onClick={toggleDemoPause}
              className="px-3.5 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#dcb538] text-[#0B1310] font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_12px_rgba(201,162,39,0.3)] transition-all"
            >
              {demoIsPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-[#0B1310]" />
                  <span>RESUME</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-[#0B1310]" />
                  <span>PAUSE</span>
                </>
              )}
            </button>

            <button
              onClick={nextDemoStep}
              disabled={demoCurrentStep >= LIVE_DEMO_PHASES.length}
              className="px-3 py-1.5 rounded-lg bg-[#0B1310] hover:bg-[#152B23] border border-tactical disabled:opacity-40 text-[#B8C4BA] text-xs flex items-center space-x-1"
            >
              <span>NEXT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Phase 11 Celebration Callout */}
        {demoCurrentStep === 11 && (
          <div className="mt-3 p-2.5 rounded bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs font-mono text-emerald-300 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>THREAT MITIGATED: Infrastructure stabilized before failure. Risk reduced 87% → 29%.</span>
            </div>
            <span className="font-bold text-emerald-200">ZERO OUTAGE</span>
          </div>
        )}
      </div>
    </div>
  );
};
