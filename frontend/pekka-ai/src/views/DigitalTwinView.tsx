import React, { useState } from 'react';
import { 
  Cpu, 
  Flame, 
  Wind, 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  Droplets, 
  Radio, 
  Thermometer, 
  Layers
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';

export const DigitalTwinView: React.FC = () => {
  const { whatIfParams, updateWhatIfParams, isInterventionApproved } = usePekka();

  // Local interactive controls for Digital Twin stress testing
  const [loadAdjustmentPct, setLoadAdjustmentPct] = useState<number>(0);
  const [reducedCapacity, setReducedCapacity] = useState<boolean>(false);
  const [pumpShutdown, setPumpShutdown] = useState<boolean>(false);
  const [demandSurge, setDemandSurge] = useState<boolean>(false);
  const [telecomFailure, setTelecomFailure] = useState<boolean>(false);
  const [extremeWeather, setExtremeWeather] = useState<boolean>(false);
  const [degradationLevel, setDegradationLevel] = useState<number>(65); // 0-100

  // Calculate simulated parameters
  const baselineTemp = isInterventionApproved ? 58.2 : 72.4;
  const tempDelta = (loadAdjustmentPct * 0.28) 
    + (extremeWeather ? 6.5 : 0) 
    + (reducedCapacity ? 5.2 : 0) 
    + (demandSurge ? 4.1 : 0);
  const simulatedTemp = Number((baselineTemp + tempDelta).toFixed(1));

  const baselineRisk = isInterventionApproved ? 29 : 87;
  const riskDelta = Math.round(
    loadAdjustmentPct * 0.7 
    + (extremeWeather ? 8 : 0) 
    + (pumpShutdown ? 6 : 0) 
    + (telecomFailure ? 5 : 0) 
    + (degradationLevel > 75 ? (degradationLevel - 75) * 0.6 : 0)
  );
  const simulatedRisk = Math.min(100, Math.max(10, baselineRisk + riskDelta));

  const handleResetControls = () => {
    setLoadAdjustmentPct(0);
    setReducedCapacity(false);
    setPumpShutdown(false);
    setDemandSurge(false);
    setTelecomFailure(false);
    setExtremeWeather(false);
    setDegradationLevel(65);
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-tactical gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center">
              DIGITAL TWIN
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-dim/20 text-cyan-neon border border-cyan-dim/40">
              SYNCHRONOUS PHYSICS MODEL
            </span>
          </div>
          <p className="text-xs text-ops-textMuted font-mono mt-0.5">
            Test the future before changing the real infrastructure // High-fidelity thermo-electric simulation
          </p>
        </div>

        <button
          onClick={handleResetControls}
          className="px-3 py-1.5 rounded bg-ops-surface hover:bg-ops-card border border-tactical text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Stress Parameters</span>
        </button>
      </div>

      {/* Grid: Interactive 3D/Isometric Schematic (Left 7 cols) + Stress Controls (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Interactive Subsystem Schematic */}
        <div className="lg:col-span-7 bg-ops-surface border border-tactical rounded p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-tactical mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-neon animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-200">
                SUBSTATION S-17 // 400kV STEP-DOWN CORE TWIN
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-neon bg-cyan-dim/15 px-2 py-0.5 rounded border border-cyan-dim/30">
              FEM SIMULATION ACTIVE
            </span>
          </div>

          {/* SVG High-Tech Isometric Transformer Schematic */}
          <div className="relative h-[380px] bg-ops-bg bg-grid-pattern rounded border border-tactical/60 flex items-center justify-center overflow-hidden">
            
            {/* Ambient Heat Glow when temperature is high */}
            <div 
              className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
              style={{
                background: simulatedTemp > 75 
                  ? 'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.25) 0%, transparent 70%)'
                  : 'radial-gradient(circle at 50% 50%, rgba(0,240,255,0.12) 0%, transparent 70%)'
              }}
            />

            <svg viewBox="0 0 600 360" className="w-full h-full max-w-lg">
              <defs>
                <linearGradient id="iron-core" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="50%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>

                <linearGradient id="copper-winding" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B45309" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
              </defs>

              {/* Tank Base Platform */}
              <polygon points="120,280 480,280 540,320 60,320" fill="#0A0E17" stroke="#1E293B" strokeWidth="2" />
              
              {/* Transformer Main Oil Tank Body */}
              <rect x="160" y="110" width="280" height="170" rx="8" fill="url(#iron-core)" stroke={simulatedTemp > 75 ? '#EF4444' : '#00F0FF'} strokeWidth="2" strokeOpacity="0.8" />
              
              {/* Tank Cooling Fins / Radiators (Left & Right) */}
              {[-1, 1].map((side, sIdx) => (
                <g key={sIdx} transform={`translate(${side === -1 ? 110 : 440}, 130)`}>
                  {[0, 18, 36, 54, 72, 90, 108].map(y => (
                    <line 
                      key={y} 
                      x1="0" 
                      y1={y} 
                      x2="50" 
                      y2={y} 
                      stroke={simulatedTemp > 75 ? '#EF4444' : '#38BDF8'} 
                      strokeWidth="3" 
                      strokeOpacity="0.7"
                    />
                  ))}
                </g>
              ))}

              {/* Primary High Voltage Bushings (Top 3 Porcelain Insulators) */}
              {[210, 300, 390].map((x, i) => (
                <g key={i}>
                  <rect x={x - 12} y="40" width="24" height="70" rx="4" fill="#1E293B" stroke="#00F0FF" strokeWidth="1.5" />
                  {[50, 65, 80, 95].map(ringY => (
                    <ellipse key={ringY} cx={x} cy={ringY} rx="16" ry="4" fill="#0F172A" stroke="#00F0FF" strokeWidth="1" />
                  ))}
                  {/* High Voltage Arc Terminal */}
                  <circle cx={x} cy="36" r="6" fill="#F59E0B" className="animate-pulse" />
                  <line x1={x} y1="30" x2={x} y2="10" stroke="#00F0FF" strokeWidth="2" strokeDasharray="3 3" />
                </g>
              ))}

              {/* Conservator Oil Tank on Top */}
              <ellipse cx="300" cy="98" rx="80" ry="12" fill="#1E293B" stroke="#334155" strokeWidth="2" />
              <rect x="220" y="86" width="160" height="16" fill="#1E293B" stroke="#334155" strokeWidth="1" />

              {/* Internal Thermal Stress Wave (Simulated Sensor View) */}
              <g transform="translate(180, 150)">
                <rect x="0" y="0" width="240" height="110" rx="4" fill="#05070B" fillOpacity="0.8" stroke="#1E293B" strokeWidth="1" />
                
                {/* 3 Phase Coils */}
                {[30, 110, 190].map((cx, idx) => (
                  <g key={idx}>
                    <rect x={cx - 20} y="15" width="40" height="80" rx="4" fill="url(#copper-winding)" strokeOpacity="0.6" />
                    {/* Thermal Hotspot Glow */}
                    <circle 
                      cx={cx} 
                      cy="55" 
                      r={simulatedTemp > 75 ? "18" : "12"} 
                      fill={simulatedTemp > 75 ? "#EF4444" : "#F59E0B"} 
                      fillOpacity={simulatedTemp > 75 ? "0.6" : "0.3"} 
                      className="animate-pulse" 
                    />
                    <text x={cx} y="58" fill="#fff" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      {['A', 'B', 'C'][idx]}
                    </text>
                  </g>
                ))}
              </g>

              {/* Telemetry Labels */}
              <text x="300" y="300" fill="#94A3B8" fontSize="11" textAnchor="middle" fontFamily="monospace">
                CORE WINDING OIL-IMMERSED TANK
              </text>
            </svg>

            {/* Live Readout Floaters */}
            <div className="absolute top-3 left-3 bg-ops-card/90 border border-tactical p-2 rounded text-[11px] font-mono space-y-1">
              <div className="flex items-center space-x-1.5">
                <Thermometer className="w-3.5 h-3.5 text-cyan-neon" />
                <span className="text-slate-400">Core Temp:</span>
                <span className={`font-bold tabular-nums ${simulatedTemp > 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {simulatedTemp}°C
                </span>
              </div>
              <div className="text-slate-500 text-[10px]">Normal: 40–65°C</div>
            </div>

            <div className="absolute top-3 right-3 bg-ops-card/90 border border-tactical p-2 rounded text-[11px] font-mono space-y-1">
              <div className="flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span className="text-slate-400">Failure Risk:</span>
                <span className={`font-bold tabular-nums ${simulatedRisk > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {simulatedRisk}%
                </span>
              </div>
              <div className="text-slate-500 text-[10px]">
                {simulatedRisk > 50 ? 'UNSTABLE TRAJECTORY' : 'WITHIN TOLERANCE'}
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Legend */}
          <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-center text-xs">
            <div className="p-2 rounded bg-ops-card border border-tactical">
              <span className="text-[10px] text-slate-500 block">DIELECTRIC STRENGTH</span>
              <span className="text-slate-200 font-bold">38.4 kV/mm</span>
            </div>
            <div className="p-2 rounded bg-ops-card border border-tactical">
              <span className="text-[10px] text-slate-500 block">HARMONIC VIBE</span>
              <span className={`font-bold ${simulatedTemp > 75 ? 'text-red-400' : 'text-cyan-neon'}`}>
                {Number((4.2 + (simulatedTemp - 60) * 0.08).toFixed(2))} mm/s
              </span>
            </div>
            <div className="p-2 rounded bg-ops-card border border-tactical">
              <span className="text-[10px] text-slate-500 block">OIL FLOW VELOCITY</span>
              <span className="text-slate-200 font-bold">1.42 m/s</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Stress Controls Panel */}
        <div className="lg:col-span-5 bg-ops-surface border border-tactical rounded p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-tactical mb-4">
              <Sliders className="w-4 h-4 text-cyan-neon" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
                STRESS TEST & INJECTION CONTROLS
              </h2>
            </div>

            {/* Slider 1: Increase Load */}
            <div className="space-y-1.5 mb-4 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Transformer Load Adjustment:</span>
                <span className={`font-bold tabular-nums ${loadAdjustmentPct > 0 ? 'text-red-400' : loadAdjustmentPct < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {loadAdjustmentPct > 0 ? `+${loadAdjustmentPct}%` : `${loadAdjustmentPct}%`}
                </span>
              </div>
              <input 
                type="range" 
                min="-30" 
                max="40" 
                step="5"
                value={loadAdjustmentPct}
                onChange={(e) => setLoadAdjustmentPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-neon"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>-30% (Shed Load)</span>
                <span>0% (Nominal)</span>
                <span>+40% (Overload)</span>
              </div>
            </div>

            {/* Slider 2: Equipment Degradation */}
            <div className="space-y-1.5 mb-4 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Equipment Degradation Level:</span>
                <span className="font-bold text-amber-400 tabular-nums">{degradationLevel}%</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="100" 
                step="5"
                value={degradationLevel}
                onChange={(e) => setDegradationLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>20% (New)</span>
                <span>65% (Observed)</span>
                <span>100% (Critical)</span>
              </div>
            </div>

            {/* Toggle Switches for Scenario Injections */}
            <div className="space-y-2.5 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Contingency Injections:
              </span>

              {/* Extreme Weather / Heatwave */}
              <label className="flex items-center justify-between p-2.5 rounded bg-ops-card border border-tactical hover:border-tactical-cyan cursor-pointer transition-colors">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Extreme Weather (+42°C Ambient Heatwave)</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={extremeWeather} 
                  onChange={(e) => setExtremeWeather(e.target.checked)} 
                  className="rounded bg-slate-900 border-slate-700 text-cyan-neon focus:ring-0 w-4 h-4"
                />
              </label>

              {/* Reduce Capacity */}
              <label className="flex items-center justify-between p-2.5 rounded bg-ops-card border border-tactical hover:border-tactical-cyan cursor-pointer transition-colors">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Zap className="w-4 h-4 text-cyan-neon" />
                  <span>Reduce Transformer Secondary Capacity</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={reducedCapacity} 
                  onChange={(e) => setReducedCapacity(e.target.checked)} 
                  className="rounded bg-slate-900 border-slate-700 text-cyan-neon focus:ring-0 w-4 h-4"
                />
              </label>

              {/* Shut down pump */}
              <label className="flex items-center justify-between p-2.5 rounded bg-ops-card border border-tactical hover:border-tactical-cyan cursor-pointer transition-colors">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>Simulate Intake Pump Station P-04 Shutdown</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={pumpShutdown} 
                  onChange={(e) => setPumpShutdown(e.target.checked)} 
                  className="rounded bg-slate-900 border-slate-700 text-cyan-neon focus:ring-0 w-4 h-4"
                />
              </label>

              {/* Communication Failure */}
              <label className="flex items-center justify-between p-2.5 rounded bg-ops-card border border-tactical hover:border-tactical-cyan cursor-pointer transition-colors">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>Induce Microwave Telecom Backhaul Packet Loss</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={telecomFailure} 
                  onChange={(e) => setTelecomFailure(e.target.checked)} 
                  className="rounded bg-slate-900 border-slate-700 text-cyan-neon focus:ring-0 w-4 h-4"
                />
              </label>

              {/* Increase Demand */}
              <label className="flex items-center justify-between p-2.5 rounded bg-ops-card border border-tactical hover:border-tactical-cyan cursor-pointer transition-colors">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Surge Peak Industrial Grid Demand</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={demandSurge} 
                  onChange={(e) => setDemandSurge(e.target.checked)} 
                  className="rounded bg-slate-900 border-slate-700 text-cyan-neon focus:ring-0 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Twin Prediction Response Callout */}
          <div className="p-3 rounded bg-ops-card border border-tactical text-xs font-mono">
            <div className="text-slate-400 mb-1 flex items-center justify-between">
              <span>TWIN SIMULATION VERDICT</span>
              <span className={`font-bold ${simulatedRisk > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                {simulatedRisk > 50 ? 'HIGH CASCADE THREAT' : 'STABILIZED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              {loadAdjustmentPct <= -12
                ? 'Shedding 12%+ load dampens core thermal accumulation by 14.2°C, preventing oil breakdown.'
                : 'Current parameters maintain accelerated degradation. Immediate cross-substation transfer recommended.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
