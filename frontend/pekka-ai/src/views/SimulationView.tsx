import React, { useState } from 'react';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ShieldAlert, 
  Users, 
  Clock, 
  Activity, 
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import { usePekka } from '../context/PekkaContext';

export const SimulationView: React.FC = () => {
  const { isInterventionApproved, approveRecommendation, setActiveTab } = usePekka();
  const [activeSimulationMode, setActiveSimulationMode] = useState<'comparison' | 'without' | 'with'>('comparison');

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-tactical gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center">
              WHAT-IF SIMULATION
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-dim/20 text-cyan-neon border border-cyan-dim/40">
              COUNTERFACTUAL IMPACT ENGINE
            </span>
          </div>
          <p className="text-xs text-ops-textMuted font-mono mt-0.5">
            Side-by-side reliability comparison // Cascading blackout trajectory vs preventive load balancing
          </p>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setActiveSimulationMode('comparison')}
            className={`px-2.5 py-1 rounded border transition-colors ${
              activeSimulationMode === 'comparison'
                ? 'bg-cyan-dim/20 text-cyan-neon border-cyan-dim/50'
                : 'text-slate-400 hover:text-slate-200 border-tactical'
            }`}
          >
            SPLIT COMPARISON
          </button>
          {!isInterventionApproved && (
            <button
              onClick={approveRecommendation}
              className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center space-x-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>APPROVE IN REAL-TIME</span>
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* PANEL 1: WITHOUT PEKKA INTERVENTION (UNMITIGATED FAILURE) */}
        <div className="bg-ops-surface border border-tactical-red rounded p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-tactical mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <h2 className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
                  WITHOUT PEKKA INTERVENTION
                </h2>
              </div>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/40">
                UNMITIGATED RUNAWAY
              </span>
            </div>

            {/* Core Failure Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4 font-mono">
              <div className="bg-ops-card p-3 rounded border border-tactical">
                <span className="text-[10px] text-slate-500 block uppercase">Failure Probability</span>
                <div className="text-3xl font-black text-red-400 mt-1 tabular-nums">87%</div>
                <span className="text-[10px] text-red-500">Critical Dielectric Rupture</span>
              </div>

              <div className="bg-ops-card p-3 rounded border border-tactical">
                <span className="text-[10px] text-slate-500 block uppercase">Expected Downtime</span>
                <div className="text-3xl font-black text-slate-100 mt-1 tabular-nums">4.6 hrs</div>
                <span className="text-[10px] text-slate-400">Emergency Substation Repair</span>
              </div>

              <div className="bg-ops-card p-3 rounded border border-tactical">
                <span className="text-[10px] text-slate-500 block uppercase">Affected Users</span>
                <div className="text-3xl font-black text-slate-100 mt-1 tabular-nums">12,400</div>
                <span className="text-[10px] text-slate-400">Metro Central Grid & Water Pump</span>
              </div>

              <div className="bg-ops-card p-3 rounded border border-tactical">
                <span className="text-[10px] text-slate-500 block uppercase">Cascading Assets</span>
                <div className="text-3xl font-black text-red-400 mt-1 tabular-nums">8</div>
                <span className="text-[10px] text-red-400">Secondary Grid Overload</span>
              </div>
            </div>

            {/* Cascade Graphic SVG */}
            <div className="p-3 bg-ops-card rounded border border-tactical">
              <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span>CASCADING BLACKOUT PROPAGATION</span>
                <span className="text-red-400 font-bold">8 NODES IMPACTED</span>
              </div>

              <svg viewBox="0 0 400 120" className="w-full h-28">
                {/* Lines showing cascade */}
                <line x1="50" y1="60" x2="150" y2="30" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="50" y1="60" x2="150" y2="90" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="150" y1="30" x2="250" y2="20" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="150" y1="30" x2="250" y2="50" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="150" y1="90" x2="250" y2="80" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="150" y1="90" x2="250" y2="105" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="250" y1="20" x2="350" y2="40" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="250" y1="105" x2="350" y2="90" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* S-17 Epicenter */}
                <circle cx="50" cy="60" r="14" fill="#7F1D1D" stroke="#EF4444" strokeWidth="2" />
                <text x="50" y="64" fill="#fff" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">S-17</text>

                {/* Layer 2: P-04, S-12 */}
                <circle cx="150" cy="30" r="11" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
                <text x="150" y="34" fill="#fff" fontSize="8" textAnchor="middle" fontFamily="monospace">P-04</text>
                
                <circle cx="150" cy="90" r="11" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
                <text x="150" y="94" fill="#fff" fontSize="8" textAnchor="middle" fontFamily="monospace">S-12</text>

                {/* Layer 3: T-09, W-01, W-02, C-22 */}
                {[
                  { cx: 250, cy: 20, name: 'T-09' },
                  { cx: 250, cy: 50, name: 'W-01' },
                  { cx: 250, cy: 80, name: 'W-02' },
                  { cx: 250, cy: 105, name: 'C-22' }
                ].map(node => (
                  <g key={node.name}>
                    <circle cx={node.cx} cy={node.cy} r="9" fill="#1E293B" stroke="#EF4444" strokeWidth="1.5" />
                    <text x={node.cx} y={node.cy + 3} fill="#EF4444" fontSize="7" textAnchor="middle" fontFamily="monospace">{node.name}</text>
                  </g>
                ))}

                {/* Layer 4: T-02, C-08 */}
                {[
                  { cx: 350, cy: 40, name: 'T-02' },
                  { cx: 350, cy: 90, name: 'C-08' }
                ].map(node => (
                  <g key={node.name}>
                    <circle cx={node.cx} cy={node.cy} r="9" fill="#1E293B" stroke="#EF4444" strokeWidth="1.5" />
                    <text x={node.cx} y={node.cy + 3} fill="#EF4444" fontSize="7" textAnchor="middle" fontFamily="monospace">{node.name}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded bg-red-950/30 border border-red-500/30 text-xs font-mono text-red-300">
            <strong>Outcome:</strong> Unplanned thermal trip at S-17 triggers overload trip on P-04 intake pumps and rail switch signals T-09 within 35 minutes.
          </div>
        </div>

        {/* PANEL 2: WITH PEKKA RECOMMENDATION (PREVENTIVE CONTAINMENT) */}
        <div className="bg-ops-surface border border-tactical-cyan rounded p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-neon/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-tactical mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-neon animate-pulse" />
                <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-neon uppercase">
                  WITH PEKKA RECOMMENDATION
                </h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-neon bg-cyan-dim/15 px-2 py-0.5 rounded border border-cyan-dim/40">
                CONTAINED & BALANCED
              </span>
            </div>

            {/* Core Preventive Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4 font-mono">
              <div className="bg-ops-card p-3 rounded border border-tactical">
                <span className="text-[10px] text-slate-500 block uppercase">Failure Probability</span>
                <div className="text-3xl font-black text-emerald-400 mt-1 tabular-nums">29%</div>
                <span className="text-[10px] text-emerald-400">↓ 58% Risk Reduction</span>
              </div>

              <div className="bg-ops-card p-3 rounded border border-tactical">
                <span className="text-[10px] text-slate-500 block uppercase">Expected Downtime</span>
                <div className="text-3xl font-black text-emerald-400 mt-1 tabular-nums">0.8 hrs</div>
                <span className="text-[10px] text-emerald-400">Scheduled Controlled Transfer</span>
              </div>

              <div className="bg-ops-card p-3 rounded border border-tactical">
                <span className="text-[10px] text-slate-500 block uppercase">Affected Users</span>
                <div className="text-3xl font-black text-slate-100 mt-1 tabular-nums">2,100</div>
                <span className="text-[10px] text-cyan-neon">10,300 Users Protected</span>
              </div>

              <div className="bg-ops-card p-3 rounded border border-tactical">
                <span className="text-[10px] text-slate-500 block uppercase">Cascading Assets</span>
                <div className="text-3xl font-black text-emerald-400 mt-1 tabular-nums">2</div>
                <span className="text-[10px] text-emerald-400">Zero Blackout Spread</span>
              </div>
            </div>

            {/* Cascade Graphic SVG: Contained */}
            <div className="p-3 bg-ops-card rounded border border-tactical">
              <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span>STABILIZED TRANSMISSION TOPOLOGY</span>
                <span className="text-emerald-400 font-bold">CASCADE PREVENTED</span>
              </div>

              <svg viewBox="0 0 400 120" className="w-full h-28">
                {/* Contained Lines */}
                <line x1="50" y1="60" x2="150" y2="60" stroke="#00F0FF" strokeWidth="2" />
                <line x1="150" y1="60" x2="250" y2="40" stroke="#10B981" strokeWidth="1.5" />
                <line x1="150" y1="60" x2="250" y2="80" stroke="#10B981" strokeWidth="1.5" />
                <line x1="250" y1="40" x2="350" y2="40" stroke="#10B981" strokeWidth="1.5" />
                <line x1="250" y1="80" x2="350" y2="80" stroke="#10B981" strokeWidth="1.5" />

                {/* S-17 Stabilized */}
                <circle cx="50" cy="60" r="14" fill="#042F2E" stroke="#10B981" strokeWidth="2" />
                <text x="50" y="64" fill="#fff" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">S-17</text>

                {/* S-04 absorbs 30 MVA */}
                <circle cx="150" cy="60" r="13" fill="#0E2A3A" stroke="#00F0FF" strokeWidth="2" />
                <text x="150" y="64" fill="#00F0FF" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">S-04</text>

                {/* Secondary nodes all stay green */}
                {[
                  { cx: 250, cy: 40, name: 'P-04' },
                  { cx: 250, cy: 80, name: 'S-12' },
                  { cx: 350, cy: 40, name: 'T-09' },
                  { cx: 350, cy: 80, name: 'W-01' }
                ].map(node => (
                  <g key={node.name}>
                    <circle cx={node.cx} cy={node.cy} r="10" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" />
                    <text x={node.cx} y={node.cy + 3} fill="#10B981" fontSize="7" textAnchor="middle" fontFamily="monospace">{node.name}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono text-emerald-300">
            <strong>Outcome:</strong> Preemptive 12% load reduction smoothly reallocates 30 MVA to Northern Substation S-04. Zero breaker trips. Grid frequency holds at 49.98 Hz.
          </div>
        </div>

      </div>
    </div>
  );
};
