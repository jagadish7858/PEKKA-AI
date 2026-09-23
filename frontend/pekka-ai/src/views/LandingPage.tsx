import React from 'react';
import { 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  TrendingDown, 
  Play, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Droplets,
  Train,
  Radio,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';

export const LandingPage: React.FC = () => {
  const { setViewMode, setActiveTab, startLiveDemo } = usePekka();

  const handleLaunchCommandCenter = () => {
    setViewMode('app');
    setActiveTab('command-center');
  };

  const handleExploreDigitalTwin = () => {
    setViewMode('app');
    setActiveTab('digital-twin');
  };

  return (
    <div className="min-h-screen bg-ops-bg text-slate-200 select-none">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-6 sm:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle Glow Backdrop */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-neon/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Hackathon Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-ops-card border border-cyan-dim/40 text-xs font-mono text-cyan-neon shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-neon animate-pulse" />
            <span>INTELLECT HACK 2026 // IEEE RELIABILITY SOCIETY SBC</span>
          </div>
        </div>

        {/* Main Hero Header & Tagline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-mono font-black tracking-tight text-slate-100 uppercase">
            SEE FAILURE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-neon via-sky-300 to-teal-300 text-glow-cyan">
              BEFORE IT HAPPENS.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 font-sans max-w-2xl mx-auto leading-relaxed">
            PEKKA AI continuously monitors critical infrastructure, predicts emerging failures, explains why they matter, and helps operators prevent disruption before it starts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 font-mono">
            <button
              onClick={handleLaunchCommandCenter}
              className="px-6 py-3 rounded bg-cyan-neon hover:bg-cyan-300 text-slate-950 font-bold text-sm tracking-wider flex items-center space-x-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all hover:scale-105"
            >
              <span>LAUNCH COMMAND CENTER</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={handleExploreDigitalTwin}
              className="px-6 py-3 rounded bg-ops-card hover:bg-ops-cardHover border border-tactical-cyan text-cyan-neon font-bold text-sm tracking-wider flex items-center space-x-2 transition-all hover:border-cyan-neon"
            >
              <Cpu className="w-4 h-4" />
              <span>EXPLORE DIGITAL TWIN</span>
            </button>

            <button
              onClick={startLiveDemo}
              className="px-5 py-3 rounded bg-ops-card hover:bg-ops-cardHover border border-tactical text-amber-300 font-bold text-sm tracking-wider flex items-center space-x-2 transition-all"
            >
              <Play className="w-4 h-4 fill-amber-300" />
              <span>RUN 60S LIVE DEMO</span>
            </button>
          </div>
        </div>

        {/* Hero Interactive Network Visual */}
        <div className="mt-12 p-1 rounded-lg bg-gradient-to-b from-cyan-neon/30 via-slate-800 to-transparent shadow-2xl">
          <div className="bg-ops-surface rounded-md border border-tactical overflow-hidden p-6 relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-tactical font-mono text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-200 font-bold">SYNCHRONOUS METROPOLITAN GRID TOPOLOGY</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="text-cyan-neon font-bold">AI CONFIDENCE: 94.7%</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-bold">HUMAN OVERSIGHT ACTIVE</span>
              </div>
            </div>

            {/* Topology Graphic Representation */}
            <div className="h-64 sm:h-80 w-full bg-ops-bg bg-grid-pattern rounded border border-tactical/60 relative flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 800 320" className="w-full h-full">
                {/* Connecting Lines */}
                <line x1="200" y1="160" x2="400" y2="100" stroke="#00F0FF" strokeWidth="2" strokeDasharray="6 4" />
                <line x1="400" y1="100" x2="600" y2="140" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="4 3" className="animate-pulse" />
                <line x1="400" y1="100" x2="400" y2="240" stroke="#00F0FF" strokeWidth="2" strokeDasharray="6 4" />
                <line x1="200" y1="160" x2="280" y2="250" stroke="#10B981" strokeWidth="1.5" />
                <line x1="400" y1="240" x2="560" y2="250" stroke="#10B981" strokeWidth="1.5" />
                <line x1="600" y1="140" x2="560" y2="250" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Nodes */}
                {/* Node 1: Water W-01 */}
                <g transform="translate(200, 160)">
                  <circle r="22" fill="#0A0E17" stroke="#00F0FF" strokeWidth="2" />
                  <text y="4" fill="#00F0FF" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">W-01</text>
                  <text y="36" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">Water Plant</text>
                </g>

                {/* Node 2: Substation S-04 */}
                <g transform="translate(400, 100)">
                  <circle r="26" fill="#0A0E17" stroke="#00F0FF" strokeWidth="2.5" />
                  <text y="5" fill="#00F0FF" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="bold">S-04</text>
                  <text y="42" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">North Grid Hub</text>
                </g>

                {/* Node 3: Target Incident S-17 (Pulsing Red) */}
                <g transform="translate(600, 140)">
                  <circle r="34" fill="none" stroke="#EF4444" strokeWidth="2" className="animate-ping opacity-50" />
                  <circle r="28" fill="#1C0A0A" stroke="#EF4444" strokeWidth="3" />
                  <text y="5" fill="#EF4444" fontSize="12" textAnchor="middle" fontFamily="monospace" fontWeight="bold">S-17</text>
                  <text y="44" fill="#EF4444" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    PREDICTED FAILURE (87%)
                  </text>
                </g>

                {/* Node 4: Intake Pump P-04 */}
                <g transform="translate(280, 250)">
                  <circle r="20" fill="#0A0E17" stroke="#F59E0B" strokeWidth="2" />
                  <text y="4" fill="#F59E0B" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">P-04</text>
                  <text y="32" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">Pump Station</text>
                </g>

                {/* Node 5: Transport Rail T-09 */}
                <g transform="translate(400, 240)">
                  <circle r="22" fill="#0A0E17" stroke="#10B981" strokeWidth="2" />
                  <text y="4" fill="#10B981" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">T-09</text>
                  <text y="36" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">Transit Hub</text>
                </g>

                {/* Node 6: Port Logistics T-02 */}
                <g transform="translate(560, 250)">
                  <circle r="20" fill="#0A0E17" stroke="#10B981" strokeWidth="2" />
                  <text y="4" fill="#10B981" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">T-02</text>
                  <text y="32" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">Intermodal Port</text>
                </g>
              </svg>

              {/* Floating Incident Intelligence Banner */}
              <div className="absolute top-4 right-4 bg-ops-card/95 border border-red-500/50 p-3 rounded font-mono text-xs max-w-xs shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between text-red-400 font-bold mb-1">
                  <span>EARLY WARNING DETECTED</span>
                  <span className="text-[10px] bg-red-950 px-1.5 py-0.5 rounded">04h 32m</span>
                </div>
                <div className="text-slate-200 font-semibold mb-1">
                  Substation S-17 Transformer Degradation
                </div>
                <div className="text-[11px] text-slate-400">
                  PEKKA recommends 12% load reduction to prevent an 8-asset cascade blackout.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UNIQUE PEKKA FEATURE: EARLY WARNING ENGINE */}
      <section className="py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-tactical">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono text-cyan-neon font-bold tracking-widest uppercase">
            // CORE ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-slate-100 uppercase mt-2">
            PEKKA EARLY WARNING ENGINE
          </h2>
          <p className="text-sm text-slate-400 font-sans mt-2">
            How PEKKA AI transforms micro-telemetry deviations into human-approved preventive infrastructure defense
          </p>
        </div>

        {/* The 6-Stage Visual Flowchart */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          {[
            {
              stage: 'STAGE 1',
              title: 'NORMAL',
              color: 'border-emerald-500/40 text-emerald-400',
              desc: 'Continuous real-time ingestion across multi-domain telemetry.'
            },
            {
              stage: 'STAGE 2',
              title: 'SUBTLE ANOMALY',
              color: 'border-cyan-dim/40 text-cyan-neon',
              desc: 'Sub-harmonic vibration & +18% thermal curve drift identified.'
            },
            {
              stage: 'STAGE 3',
              title: 'CORRELATED SIGNALS',
              color: 'border-amber-500/40 text-amber-400',
              desc: 'Cross-sensor fusion eliminates noise & matches failure precedents.'
            },
            {
              stage: 'STAGE 4',
              title: 'PREDICTED FAILURE',
              color: 'border-red-500/50 text-red-400',
              desc: '87% probability forecast with 04h 32m critical countdown horizon.'
            },
            {
              stage: 'STAGE 5',
              title: 'PREVENTIVE ACTION',
              color: 'border-cyan-neon text-cyan-neon',
              desc: 'Optimal 12% load rerouting generated & tested via Digital Twin.'
            },
            {
              stage: 'STAGE 6',
              title: 'RISK REDUCED',
              color: 'border-emerald-500 text-emerald-400',
              desc: 'Human approves dispatch. Risk plunges to 29%. Zero downtime.'
            }
          ].map((step, idx) => (
            <div
              key={step.title}
              className={`p-4 rounded bg-ops-surface border ${step.color} flex flex-col justify-between space-y-2 relative shadow-md`}
            >
              <div>
                <span className="text-[10px] text-slate-500 block">{step.stage}</span>
                <span className="text-sm font-bold tracking-wider block mt-0.5">{step.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURE STORY: DETECT, PREDICT, EXPLAIN, SIMULATE, PREVENT */}
      <section className="py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-tactical">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono text-cyan-neon font-bold tracking-widest uppercase">
            // FIVE PILLARS
          </span>
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-slate-100 uppercase mt-2">
            DESIGNED FOR ZERO UNPLANNED OUTAGES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
          
          {/* 1. DETECT */}
          <div className="p-5 rounded bg-ops-surface border border-tactical hover:border-tactical-cyan transition-all space-y-3">
            <div className="w-10 h-10 rounded bg-ops-card border border-tactical flex items-center justify-center text-cyan-neon">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">1. DETECT</h3>
            <p className="text-slate-400 font-sans leading-relaxed">
              Find abnormal behaviour before it becomes a failure. Ingests high-frequency sensors across transformers, pumps, switches, and telecom relays at sub-second latency.
            </p>
          </div>

          {/* 2. PREDICT */}
          <div className="p-5 rounded bg-ops-surface border border-tactical hover:border-tactical-cyan transition-all space-y-3">
            <div className="w-10 h-10 rounded bg-ops-card border border-tactical flex items-center justify-center text-red-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">2. PREDICT</h3>
            <p className="text-slate-400 font-sans leading-relaxed">
              Know what could fail and when. Calculates probabilistic failure horizons with exact time-to-failure countdowns and multi-asset 24-hour degradation curves.
            </p>
          </div>

          {/* 3. EXPLAIN */}
          <div className="p-5 rounded bg-ops-surface border border-tactical hover:border-tactical-cyan transition-all space-y-3">
            <div className="w-10 h-10 rounded bg-ops-card border border-tactical flex items-center justify-center text-cyan-neon">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">3. EXPLAIN</h3>
            <p className="text-slate-400 font-sans leading-relaxed">
              Understand why PEKKA made the prediction. Provides feature contribution percentages and interactive causal directed acyclic graphs (DAG) showing physical defect mechanisms.
            </p>
          </div>

          {/* 4. SIMULATE */}
          <div className="p-5 rounded bg-ops-surface border border-tactical hover:border-tactical-cyan transition-all space-y-3">
            <div className="w-10 h-10 rounded bg-ops-card border border-tactical flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">4. SIMULATE</h3>
            <p className="text-slate-400 font-sans leading-relaxed">
              Test interventions before changing the real infrastructure. Explore stress testing in the Digital Twin and evaluate side-by-side What-If counterfactual outcomes.
            </p>
          </div>

          {/* 5. PREVENT */}
          <div className="p-5 rounded bg-ops-surface border border-tactical hover:border-tactical-cyan transition-all space-y-3 md:col-span-2 lg:col-span-2">
            <div className="w-10 h-10 rounded bg-ops-card border border-tactical flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">5. PREVENT</h3>
            <p className="text-slate-400 font-sans leading-relaxed">
              Turn AI predictions into human-approved preventive action. Maintains strict advisory autonomy: PEKKA DETECTS → RECOMMENDS → HUMAN APPROVES → SYSTEM ACTS.
            </p>
          </div>

        </div>
      </section>

      {/* 4. FOOTER & HACKATHON CREDITS */}
      <footer className="py-8 px-6 sm:px-12 max-w-7xl mx-auto border-t border-tactical flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-500">
        <div>
          <span className="font-bold text-slate-300">PEKKA AI</span> // Autonomous Critical Infrastructure Intelligence
        </div>
        <div>
          Built for <strong className="text-slate-300">INTELLECT HACK 2026</strong> — IEEE Reliability Society SBC
        </div>
      </footer>

    </div>
  );
};
